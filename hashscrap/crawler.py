"""Bounded Scrapy runner for explicitly configured sources."""
from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any

from scrapy.crawler import CrawlerProcess
from scrapy.settings import Settings

from hashscrap.config import AppConfig, Source
from hashscrap.source_registry import SourceRegistry
from hashscrap.spiders.bounded import BoundedSpider


@dataclass(frozen=True)
class CrawlResult:
    source_id: str
    requested_urls: int
    responses: int
    failures: int
    items: tuple[dict[str, Any], ...]
    error_reasons: tuple[str, ...]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class ResultCollector:
    """Scrapy extension storing bounded run results in process memory."""

    def __init__(self) -> None:
        self.items: list[dict[str, Any]] = []
        self.errors: list[str] = []
        self.responses = 0

    @classmethod
    def from_crawler(cls, crawler: Any) -> "ResultCollector":
        instance = cls()
        crawler.signals.connect(instance.item_scraped, signal=__import__("scrapy").signals.item_scraped)
        crawler.signals.connect(instance.response_received, signal=__import__("scrapy").signals.response_received)
        crawler.signals.connect(instance.spider_error, signal=__import__("scrapy").signals.spider_error)
        crawler.signals.connect(instance.request_dropped, signal=__import__("scrapy").signals.request_dropped)
        crawler.result_collector = instance
        return instance

    def item_scraped(self, item: Any, response: Any, spider: Any) -> None:
        self.items.append(dict(item))

    def response_received(self, response: Any, request: Any, spider: Any) -> None:
        self.responses += 1

    def spider_error(self, failure: Any, response: Any, spider: Any) -> None:
        self.errors.append("spider_error")

    def request_dropped(self, request: Any, spider: Any) -> None:
        self.errors.append("request_dropped")


def _settings(source: Source) -> Settings:
    limits = source.limits
    return Settings({
        "BOT_NAME": "hashscrap",
        "ROBOTSTXT_OBEY": True,
        "USER_AGENT": "HashScrap/0.1 (+bounded public-source collection)",
        "CONCURRENT_REQUESTS": limits.concurrency,
        "CONCURRENT_REQUESTS_PER_DOMAIN": limits.concurrency,
        "DOWNLOAD_DELAY": 1.0 / limits.requests_per_second,
        "DOWNLOAD_TIMEOUT": limits.timeout_seconds,
        "DOWNLOAD_MAXSIZE": limits.max_response_bytes,
        "HASHSCRAP_MAX_REQUESTS": limits.max_pages,
        "DOWNLOAD_FAIL_ON_DATALOSS": True,
        "DEPTH_LIMIT": limits.max_depth,
        "DEPTH_PRIORITY": 1,
        "RETRY_ENABLED": True,
        "RETRY_TIMES": 2,
        "REDIRECT_ENABLED": True,
        "TELNETCONSOLE_ENABLED": False,
        "LOG_LEVEL": "WARNING",
        "EXTENSIONS": {"hashscrap.crawler.ResultCollector": 500},
        "DOWNLOADER_MIDDLEWARES": {
            "hashscrap.middleware.RequestBudgetMiddleware": 40,
            "hashscrap.middleware.URLSafetyMiddleware": 50,
            "scrapy.downloadermiddlewares.redirect.RedirectMiddleware": 600,
        },
    })


def collect(
    config: AppConfig,
    source_id: str,
    start_urls: list[str],
) -> CrawlResult:
    """Run a single bounded crawl and return intermediate in-memory results."""
    source = SourceRegistry(config).get_enabled(source_id)
    if not start_urls:
        raise ValueError("at least one start URL is required")
    for url in start_urls:
        if not _in_source_scope(url, source):
            raise ValueError("start URL is outside the configured source scope")

    process = CrawlerProcess(settings=_settings(source))
    crawler = process.create_crawler(BoundedSpider)
    process.crawl(crawler, source=source.model_dump(), start_urls=start_urls)
    process.start(stop_after_crawl=True)
    collector = getattr(crawler, "result_collector", None)
    if collector is None:
        return CrawlResult(source_id, len(start_urls), 0, 1, (), ("crawler_not_started",))
    return CrawlResult(
        source_id=source_id,
        requested_urls=len(start_urls),
        responses=collector.responses,
        failures=len(collector.errors),
        items=tuple(collector.items),
        error_reasons=tuple(collector.errors),
    )


def _in_source_scope(url: str, source: Source) -> bool:
    from urllib.parse import urlsplit

    try:
        hostname = urlsplit(url).hostname
    except ValueError:
        return False
    return bool(hostname and hostname.lower().rstrip(".") in source.allowed_hosts)
