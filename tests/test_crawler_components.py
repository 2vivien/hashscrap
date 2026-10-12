from __future__ import annotations

from types import SimpleNamespace

import pytest
from scrapy.exceptions import IgnoreRequest
from scrapy.http import HtmlResponse, Request

from hashscrap.middleware import RequestBudgetMiddleware, URLSafetyMiddleware
from hashscrap.spiders.bounded import BoundedSpider


def source_data(**limit_overrides: int) -> dict[str, object]:
    limits: dict[str, int] = {
        "timeout_seconds": 10,
        "concurrency": 2,
        "requests_per_second": 1,
        "max_depth": 1,
        "max_pages": 2,
        "max_response_bytes": 100_000,
    }
    limits.update(limit_overrides)
    return {
        "id": "local-test",
        "allowed_hosts": ["127.0.0.1"],
        "limits": limits,
    }


def test_request_budget_rejects_requests_after_limit() -> None:
    middleware = RequestBudgetMiddleware(max_requests=1)
    request = Request("http://127.0.0.1/")
    middleware.process_request(request, object())  # first request stays within budget
    with pytest.raises(IgnoreRequest, match="budget exhausted"):
        middleware.process_request(request, object())


def test_url_middleware_rejects_policy_denial(monkeypatch: pytest.MonkeyPatch) -> None:
    import hashscrap.middleware as middleware_module

    monkeypatch.setattr(
        middleware_module,
        "validate_url",
        lambda _url: SimpleNamespace(allowed=False, reason="non_public_destination"),
    )
    with pytest.raises(IgnoreRequest, match="non_public_destination"):
        URLSafetyMiddleware().process_request(Request("http://example.org/"), object())


def test_spider_emits_typed_intermediate_fields_and_stops_at_page_limit() -> None:
    spider = BoundedSpider(source=source_data(), start_urls=["http://127.0.0.1/"])
    request = Request("http://127.0.0.1/", meta={"depth": 0})
    response = HtmlResponse(
        url=request.url,
        request=request,
        status=200,
        body=b"<html><head><title>Local</title></head><body><a href='/next'>Next</a></body></html>",
        encoding="utf-8",
    )
    output = list(spider.parse(response))
    first = output[0]
    assert isinstance(first, dict)
    assert first["title"] == "Local"
    assert first["status"] == 200
    assert len(output) == 2
    assert isinstance(output[1], Request)


def test_spider_does_not_follow_links_beyond_depth_limit() -> None:
    spider = BoundedSpider(source=source_data(max_depth=0), start_urls=["http://127.0.0.1/"])
    request = Request("http://127.0.0.1/", meta={"depth": 0})
    response = HtmlResponse(
        url=request.url,
        request=request,
        status=200,
        body=b"<html><body><a href='/next'>Next</a></body></html>",
        encoding="utf-8",
    )
    output = list(spider.parse(response))
    assert len(output) == 1
