"""Generic spider restricted to an explicitly configured host scope."""

from __future__ import annotations

from collections.abc import Iterable
from datetime import UTC, datetime
from typing import Any
from urllib.parse import urljoin, urlsplit

import scrapy
from scrapy.http import Response


class BoundedSpider(scrapy.Spider):
    name = "hashscrap_bounded"

    def __init__(
        self,
        source: dict[str, Any],
        start_urls: list[str],
        include_body: bool = False,
        *args: Any,
        **kwargs: Any,
    ) -> None:
        super().__init__(*args, **kwargs)
        self.source = source
        self.start_urls = start_urls
        self.allowed_domains = list(source["allowed_hosts"])
        self.max_pages = int(source["limits"]["max_pages"])
        self.max_depth = int(source["limits"]["max_depth"])
        self.include_body = include_body
        self.pages_seen = 0
        self.error_reasons: list[str] = []

    def start_requests(self) -> Iterable[scrapy.Request]:
        for url in self.start_urls:
            yield scrapy.Request(url, callback=self.parse, errback=self.on_error, dont_filter=False)

    def parse(
        self, response: Response, **kwargs: object
    ) -> Iterable[dict[str, Any] | scrapy.Request]:
        self.pages_seen += 1
        item: dict[str, Any] = {
            "source_id": self.source["id"],
            "url": response.url,
            "status": response.status,
            "content_type": (response.headers.get("Content-Type") or b"").decode("latin-1"),
            "body_bytes": len(response.body),
            "title": response.css("title::text").get(default="").strip(),
            "links_count": len(response.css("a::attr(href)").getall()),
            "fetched_at": datetime.now(UTC),
        }
        # The response body is only attached when a consumer streams items out of the
        # crawler; otherwise it is dropped here to keep memory bounded.
        if self.include_body:
            item["body"] = response.body
        yield item
        if self.pages_seen >= self.max_pages:
            return
        depth = response.meta.get("depth", 0)
        if depth >= self.max_depth:
            return
        for href in response.css("a::attr(href)").getall():
            target = urljoin(response.url, href)
            hostname = urlsplit(target).hostname
            if hostname and hostname.lower().rstrip(".") in self.allowed_domains:
                yield scrapy.Request(
                    target,
                    callback=self.parse,
                    errback=self.on_error,
                    dont_filter=False,
                )

    def on_error(self, failure: Any) -> None:
        request = getattr(failure, "request", None)
        response = getattr(failure, "value", None)
        status = getattr(response, "status", None)
        if status == 429:
            self.error_reasons.append("http_429")
        elif status is not None and status >= 500:
            self.error_reasons.append("http_5xx")
        elif getattr(failure, "type", None) is not None:
            self.error_reasons.append("request_failed")
        if request is not None:
            request.meta["hashscrap_error_classified"] = True
