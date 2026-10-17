"""Integration tests for the `hashscrap run` command (collect → persist).

They exercise the CLI without PostgreSQL and without any public network access: the
database engine is replaced by a local SQLite file and the Scrapy collector is replaced
by a deterministic feeder over `tests/fixtures/corpus/`. Loopback and private
destinations are refused by the URL policy, so `tests/fixture_server.py` cannot drive
`hashscrap run`; feeding already-scraped items is the honest substitute for a live crawl.
"""

from __future__ import annotations

import json
from collections.abc import Callable, Iterator
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, cast

import pytest
from sqlalchemy import create_engine, func, select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

import hashscrap.crawler as crawler_module
import hashscrap.db as db_module
from hashscrap.cli import main
from hashscrap.config import AppConfig
from hashscrap.crawler import CrawlResult
from hashscrap.models import Base, Document, Observation

CORPUS = Path(__file__).parent / "fixtures" / "corpus"
SOURCE_ID = "local-fixture"


def write_config(path: Path) -> Path:
    path.write_text(
        json.dumps(
            {
                "sources": [
                    {
                        "id": SOURCE_ID,
                        "name": "Local fixture corpus",
                        "base_url": "https://fixture.example",
                        "allowed_hosts": ["fixture.example"],
                    }
                ]
            }
        ),
        encoding="utf-8",
    )
    return path


def corpus_item(path: str) -> dict[str, Any]:
    body = (CORPUS / path).read_bytes()
    return {
        "source_id": SOURCE_ID,
        "url": f"https://fixture.example/{path}",
        "status": 200,
        "content_type": "text/html; charset=utf-8",
        "body": body,
        "body_bytes": len(body),
        "fetched_at": datetime(2026, 10, 12, 10, 0, tzinfo=UTC),
    }


def feed_collect(
    items: list[dict[str, Any]],
    *,
    failures: int = 0,
    error_reasons: tuple[str, ...] = (),
) -> Callable[..., CrawlResult]:
    """Build a `hashscrap.crawler.collect` stand-in that feeds fixed scraped items."""

    def fake_collect(
        config: AppConfig,
        source_id: str,
        start_urls: list[str],
        *,
        on_item: Callable[[dict[str, Any]], None] | None = None,
    ) -> CrawlResult:
        del config  # the fixture config is validated by the CLI before collection
        for item in items:
            if on_item is not None:
                on_item(item)
        return CrawlResult(
            source_id=source_id,
            requested_urls=len(start_urls),
            responses=len(items),
            failures=failures,
            items=(),
            error_reasons=error_reasons,
        )

    return fake_collect


@pytest.fixture
def database_url(tmp_path: Path) -> str:
    return f"sqlite+pysqlite:///{tmp_path / 'cli-run.db'}"


@pytest.fixture
def installed_engine(monkeypatch: pytest.MonkeyPatch, database_url: str) -> Iterator[None]:
    """Replace the PostgreSQL engine factory with a SQLite file so no service is needed."""

    def fake_engine() -> Engine:
        engine = create_engine(database_url)
        Base.metadata.create_all(engine)
        return engine

    monkeypatch.setattr(db_module, "create_database_engine", fake_engine)
    yield


def count_rows(database_url: str, model: type[Any]) -> int:
    engine = create_engine(database_url)
    try:
        with Session(engine) as session:
            return int(session.scalar(select(func.count()).select_from(model)) or 0)
    finally:
        engine.dispose()


def load_observations(database_url: str) -> list[Observation]:
    engine = create_engine(database_url)
    try:
        with Session(engine) as session:
            return list(session.scalars(select(Observation)))
    finally:
        engine.dispose()


def summary_from(capsys: pytest.CaptureFixture[str]) -> dict[str, Any]:
    captured = capsys.readouterr()
    assert captured.err == ""
    return cast(dict[str, Any], json.loads(captured.out))


def test_run_persists_documents_and_observations_and_exits_zero(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    installed_engine: None,
    database_url: str,
    capsys: pytest.CaptureFixture[str],
) -> None:
    config = write_config(tmp_path / "sources.json")
    monkeypatch.setattr(
        crawler_module,
        "collect",
        feed_collect([corpus_item("index.html"), corpus_item("page-2.html")]),
    )

    exit_code = main(["run", "--config", str(config), "--source", SOURCE_ID])

    assert exit_code == 0
    summary = summary_from(capsys)
    assert summary["source_id"] == SOURCE_ID
    assert summary["documents_created"] == 2
    assert summary["observations_created"] > 0
    assert summary["failures"] == 0
    assert count_rows(database_url, Document) == 2

    observations = load_observations(database_url)
    assert observations
    for observation in observations:
        assert observation.document_id is not None
        assert observation.evidence_ref
        assert observation.extractor
        assert observation.extractor_version
        assert observation.raw_value is not None
        assert observation.observed_at is not None


def test_run_second_invocation_is_idempotent(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    installed_engine: None,
    database_url: str,
    capsys: pytest.CaptureFixture[str],
) -> None:
    config = write_config(tmp_path / "sources.json")
    monkeypatch.setattr(crawler_module, "collect", feed_collect([corpus_item("index.html")]))

    assert main(["run", "--config", str(config), "--source", SOURCE_ID]) == 0
    first = summary_from(capsys)
    assert first["documents_created"] == 1

    assert main(["run", "--config", str(config), "--source", SOURCE_ID]) == 0
    second = summary_from(capsys)

    assert second["documents_created"] == 0
    assert second["documents_updated"] == 1
    assert count_rows(database_url, Document) == 1


def test_run_partial_failure_exits_one(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    installed_engine: None,
    database_url: str,
    capsys: pytest.CaptureFixture[str],
) -> None:
    config = write_config(tmp_path / "sources.json")
    monkeypatch.setattr(
        crawler_module,
        "collect",
        feed_collect([corpus_item("index.html")], failures=1, error_reasons=("request_dropped",)),
    )

    exit_code = main(["run", "--config", str(config), "--source", SOURCE_ID])

    assert exit_code == 1
    summary = summary_from(capsys)
    assert summary["failures"] == 1
    assert "request_dropped" in summary["error_reasons"]
    assert summary["documents_created"] == 1


def test_run_complete_failure_exits_one(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    installed_engine: None,
    database_url: str,
    capsys: pytest.CaptureFixture[str],
) -> None:
    config = write_config(tmp_path / "sources.json")
    monkeypatch.setattr(
        crawler_module,
        "collect",
        feed_collect([], failures=2, error_reasons=("request_dropped", "spider_error")),
    )

    exit_code = main(["run", "--config", str(config), "--source", SOURCE_ID])

    assert exit_code == 1
    summary = summary_from(capsys)
    assert summary["failures"] == 2
    assert summary["documents_created"] == 0
    assert count_rows(database_url, Document) == 0


def test_run_without_database_environment_exits_two(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    monkeypatch.delenv("HASHSCRAP_DATABASE_URL", raising=False)
    config = write_config(tmp_path / "sources.json")

    exit_code = main(["run", "--config", str(config), "--source", SOURCE_ID])

    captured = capsys.readouterr()
    assert exit_code == 2
    assert captured.out == ""
    assert "HASHSCRAP_DATABASE_URL" in captured.err


def test_run_with_non_postgres_database_exits_two(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    monkeypatch.setenv("HASHSCRAP_DATABASE_URL", "sqlite+pysqlite:///:memory:")
    config = write_config(tmp_path / "sources.json")

    exit_code = main(["run", "--config", str(config), "--source", SOURCE_ID])

    captured = capsys.readouterr()
    assert exit_code == 2
    assert captured.out == ""
    assert "PostgreSQL" in captured.err
