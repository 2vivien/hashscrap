"""Validated, conservative configuration models for HashScrap.

This module intentionally has no dependency on Scrapy, network clients, or persistence.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Literal
from urllib.parse import urlsplit

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

MAX_TIMEOUT_SECONDS = 120
MAX_CONCURRENCY = 16
MAX_REQUESTS_PER_SECOND = 5.0
MAX_DEPTH = 10
MAX_PAGES = 10_000
MAX_RESPONSE_BYTES = 10 * 1024 * 1024


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class CrawlLimits(StrictModel):
    timeout_seconds: int = Field(default=10, ge=1, le=MAX_TIMEOUT_SECONDS)
    concurrency: int = Field(default=2, ge=1, le=MAX_CONCURRENCY)
    requests_per_second: float = Field(default=1.0, gt=0, le=MAX_REQUESTS_PER_SECOND)
    max_depth: int = Field(default=2, ge=0, le=MAX_DEPTH)
    max_pages: int = Field(default=100, ge=1, le=MAX_PAGES)
    max_response_bytes: int = Field(default=1_000_000, ge=1, le=MAX_RESPONSE_BYTES)


class Source(StrictModel):
    id: str = Field(pattern=r"^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$")
    name: str = Field(min_length=1, max_length=120)
    type: Literal["website"] = "website"
    base_url: str
    enabled: bool = True
    allowed_hosts: list[str] = Field(default_factory=list, min_length=1, max_length=100)
    limits: CrawlLimits = Field(default_factory=CrawlLimits)

    @field_validator("base_url")
    @classmethod
    def validate_base_url(cls, value: str) -> str:
        parts = urlsplit(value)
        if parts.scheme not in {"http", "https"}:
            raise ValueError("base_url must use HTTP or HTTPS")
        if not parts.hostname or parts.username is not None or parts.password is not None:
            raise ValueError("base_url must have a host and must not contain credentials")
        if parts.fragment:
            raise ValueError("base_url must not contain a fragment")
        try:
            _ = parts.port
        except ValueError as exc:
            raise ValueError("base_url contains an invalid port") from exc
        return value.rstrip("/")

    @field_validator("allowed_hosts")
    @classmethod
    def validate_allowed_hosts(cls, hosts: list[str]) -> list[str]:
        normalized = [host.lower().rstrip(".") for host in hosts]
        if any(not host or "/" in host or ":" in host or "@" in host for host in normalized):
            raise ValueError("allowed_hosts must contain hostnames only")
        if len(set(normalized)) != len(normalized):
            raise ValueError("allowed_hosts must not contain duplicates")
        return normalized

    @model_validator(mode="after")
    def base_host_is_allowed(self) -> Source:
        host = (urlsplit(self.base_url).hostname or "").lower().rstrip(".")
        if host not in self.allowed_hosts:
            raise ValueError("base_url host must be included in allowed_hosts")
        return self


class AppConfig(StrictModel):
    limits: CrawlLimits = Field(default_factory=CrawlLimits)
    sources: list[Source] = Field(default_factory=list, max_length=500)

    @model_validator(mode="after")
    def unique_source_ids(self) -> AppConfig:
        ids = [source.id for source in self.sources]
        if len(ids) != len(set(ids)):
            raise ValueError("source ids must be unique")
        for source in self.sources:
            limits = source.limits
            global_limits = self.limits
            if limits.timeout_seconds > global_limits.timeout_seconds:
                raise ValueError(f"source {source.id!r} exceeds global timeout limit")
            if limits.concurrency > global_limits.concurrency:
                raise ValueError(f"source {source.id!r} exceeds global concurrency limit")
            if limits.requests_per_second > global_limits.requests_per_second:
                raise ValueError(f"source {source.id!r} exceeds global request rate")
            if limits.max_depth > global_limits.max_depth:
                raise ValueError(f"source {source.id!r} exceeds global depth limit")
            if limits.max_pages > global_limits.max_pages:
                raise ValueError(f"source {source.id!r} exceeds global page limit")
            if limits.max_response_bytes > global_limits.max_response_bytes:
                raise ValueError(f"source {source.id!r} exceeds global response size limit")
        return self


def load_config(path: str | Path) -> AppConfig:
    """Load a UTF-8 JSON config and return a fully validated model."""
    try:
        raw = json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise ValueError("configuration file could not be read or parsed") from exc
    try:
        return AppConfig.model_validate(raw)
    except Exception as exc:
        # Avoid echoing raw config values in errors; callers get a safe summary.
        raise ValueError("configuration validation failed") from exc
