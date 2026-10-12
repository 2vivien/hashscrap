import json

import pytest
from pydantic import ValidationError

from hashscrap.config import AppConfig, CrawlLimits, Source, load_config


def valid_source(**overrides: object) -> dict[str, object]:
    source: dict[str, object] = {
        "id": "demo",
        "name": "Demo",
        "base_url": "https://example.org",
        "allowed_hosts": ["example.org"],
    }
    source.update(overrides)
    return source


def test_defaults_are_conservative() -> None:
    limits = CrawlLimits()
    assert limits.timeout_seconds == 10
    assert limits.concurrency == 2
    assert limits.requests_per_second == 1.0
    assert limits.max_depth == 2
    assert limits.max_pages == 100
    assert limits.max_response_bytes == 1_000_000


def test_valid_config_is_normalized() -> None:
    source = Source.model_validate(valid_source(base_url="https://example.org/"))
    assert source.base_url == "https://example.org"
    assert source.allowed_hosts == ["example.org"]


@pytest.mark.parametrize("url", [
    "file:///etc/passwd",
    "ftp://example.org",
    "https://user:secret@example.org",
    "https://example.org/#fragment",
    "https://example.org:invalid",
])
def test_rejects_unsafe_or_malformed_base_urls(url: str) -> None:
    with pytest.raises(ValidationError):
        Source.model_validate(valid_source(base_url=url))


def test_rejects_unknown_fields() -> None:
    with pytest.raises(ValidationError):
        Source.model_validate(valid_source(unreviewed=True))


def test_rejects_excessive_limits() -> None:
    with pytest.raises(ValidationError):
        CrawlLimits(concurrency=MAX_TEST_CONCURRENCY)


MAX_TEST_CONCURRENCY = 17


def test_rejects_duplicate_source_ids() -> None:
    source = valid_source()
    with pytest.raises(ValidationError):
        AppConfig.model_validate({"sources": [source, source]})


def test_rejects_source_exceeding_global_limits() -> None:
    source = valid_source(limits={"max_pages": 101})
    with pytest.raises(ValidationError):
        AppConfig.model_validate({"limits": {"max_pages": 100}, "sources": [source]})


def test_load_config_hides_raw_validation_details(tmp_path) -> None:
    path = tmp_path / "bad.json"
    path.write_text(json.dumps({"secret": "do-not-echo"}), encoding="utf-8")
    with pytest.raises(ValueError, match="configuration validation failed") as exc:
        load_config(path)
    assert "do-not-echo" not in str(exc.value)


def test_load_config_rejects_malformed_json(tmp_path) -> None:
    path = tmp_path / "bad.json"
    path.write_text("{", encoding="utf-8")
    with pytest.raises(ValueError, match="could not be read or parsed"):
        load_config(path)
