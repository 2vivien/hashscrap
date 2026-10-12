"""Downloader middleware enforcing URL policy before every HTTP request."""
from __future__ import annotations

from scrapy.exceptions import IgnoreRequest
from scrapy.http import Request

from hashscrap.url_policy import validate_url


class URLSafetyMiddleware:
    """Reject requests whose URL or DNS destination fails the security policy.

    Scrapy re-enters downloader request middleware for each redirect request, so the
    redirect target is checked before it is fetched. The transport must still be
    hardened against DNS rebinding; see docs/URL-SECURITY.md.
    """

    def process_request(self, request: Request, spider: object) -> None:
        decision = validate_url(request.url)
        if not decision.allowed:
            raise IgnoreRequest(f"URL policy rejected request: {decision.reason}")
        return None
