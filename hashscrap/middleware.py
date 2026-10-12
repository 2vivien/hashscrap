"""Downloader middleware enforcing URL and request-budget policies."""

from __future__ import annotations

from typing import Any

from scrapy.exceptions import IgnoreRequest
from scrapy.http import Request

from hashscrap.url_policy import validate_url


class URLSafetyMiddleware:
    """Reject requests whose URL or DNS destination fails the security policy.

    Redirect requests pass through downloader request middleware again. The transport
    must still be hardened against DNS rebinding; see docs/URL-SECURITY.md.
    """

    def process_request(self, request: Request, spider: object) -> None:
        decision = validate_url(request.url)
        if not decision.allowed:
            raise IgnoreRequest(f"URL policy rejected request: {decision.reason}")
        return None


class RequestBudgetMiddleware:
    """Bound total outbound request attempts, including redirects and retries."""

    def __init__(self, max_requests: int) -> None:
        self.max_requests = max_requests
        self.requests_started = 0

    @classmethod
    def from_crawler(cls, crawler: Any) -> RequestBudgetMiddleware:
        return cls(crawler.settings.getint("HASHSCRAP_MAX_REQUESTS", 100))

    def process_request(self, request: Request, spider: object) -> None:
        if self.requests_started >= self.max_requests:
            raise IgnoreRequest("request budget exhausted")
        self.requests_started += 1
        return None
