"""Smoke tests for the HashScrap command-line entry point.

The report command is exercised against an in-memory SQLite engine: no PostgreSQL and no
network access is required.
"""

from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path

import pytest
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from hashscrap import __version__
from hashscrap.cli import main
from hashscrap.models import Base, CrawlJob, CrawlRun, Document, Observation
from hashscrap.models import Source as SourceRow

OBSERVED_AT = datetime(2026, 10, 1, 8, 0, tzinfo=UTC)


def test_cli_without_arguments_prints_help(capsys: pytest.CaptureFixture[str]) -> None:
    assert main([]) == 0

    output = capsys.readouterr().out
    assert "HashScrap" in output
    assert "--version" in output


def test_cli_version_prints_package_version(capsys: pytest.CaptureFixture[str]) -> None:
    with pytest.raises(SystemExit) as exc_info:
        main(["--version"])

    assert exc_info.value.code == 0
    assert f"hashscrap {__version__}" in capsys.readouterr().out


def memory_engine() -> Engine:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    return engine


def seed(engine: Engine) -> None:
    with Session(engine) as session:
        source = SourceRow(
            source_key="alpha", source_type="http", base_url="https://alpha.test/", enabled=True
        )
        session.add(source)
        session.flush()
        job = CrawlJob(
            source_id=source.id,
            input_url="https://alpha.test/",
            status="succeeded",
            attempts=1,
            max_attempts=1,
            idempotency_key="cli-report-1",
        )
        session.add(job)
        session.flush()
        run = CrawlRun(
            job_id=job.id,
            status="succeeded",
            started_at=OBSERVED_AT,
            finished_at=OBSERVED_AT,
            fetched_count=1,
            failed_count=0,
        )
        session.add(run)
        session.flush()
        document = Document(
            source_id=source.id,
            run_id=run.id,
            original_url="https://alpha.test/company",
            content_sha256="c" * 64,
            status_code=200,
            first_seen_at=OBSERVED_AT,
            last_seen_at=OBSERVED_AT,
        )
        session.add(document)
        session.flush()
        session.add(
            Observation(
                document_id=document.id,
                source_id=source.id,
                run_id=run.id,
                observed_at=OBSERVED_AT,
                field_name="title",
                raw_value="Alpha Corp",
                normalized_value="Alpha Corp",
                extractor="html",
                extractor_version="1",
                evidence_ref="css:title",
                validation_status="unreviewed",
            )
        )
        session.commit()


def test_report_command_renders_json_to_stdout(
    monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    engine = memory_engine()
    seed(engine)
    monkeypatch.setattr("hashscrap.db.create_database_engine", lambda: engine)

    assert main(["report", "--format", "json"]) == 0

    captured = capsys.readouterr()
    assert captured.err == ""
    payload = json.loads(captured.out)
    assert payload["schema_version"] == "1.0"
    assert payload["investigation_id"] == "local"
    assert payload["observations"][0]["evidence_ref"] == "css:title"
    assert payload["observations"][0]["source_url"] == "https://alpha.test/company"
    engine.dispose()


def test_report_command_renders_markdown_by_default(
    monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    engine = memory_engine()
    seed(engine)
    monkeypatch.setattr("hashscrap.db.create_database_engine", lambda: engine)

    assert main(["report", "--title", "Alpha report", "--scope", "alpha only"]) == 0

    output = capsys.readouterr().out
    assert "# Alpha report" in output
    assert "alpha only" in output
    assert "css:title" in output
    engine.dispose()


def test_report_command_writes_output_file(
    monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str], tmp_path: Path
) -> None:
    engine = memory_engine()
    seed(engine)
    monkeypatch.setattr("hashscrap.db.create_database_engine", lambda: engine)
    destination = tmp_path / "report.json"

    assert main(["report", "--format", "json", "--output", str(destination)]) == 0

    assert capsys.readouterr().out == ""
    payload = json.loads(destination.read_text(encoding="utf-8"))
    assert payload["investigation_id"] == "local"
    engine.dispose()


def test_report_command_reports_configuration_error_without_leaking_content(
    monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    def fail() -> Engine:
        raise RuntimeError("HASHSCRAP_DATABASE_URL is required")

    monkeypatch.setattr("hashscrap.db.create_database_engine", fail)

    assert main(["report"]) == 2

    captured = capsys.readouterr()
    assert captured.out == ""
    assert captured.err.startswith("hashscrap: ")


def test_report_command_rejects_invalid_limit(
    monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    engine = memory_engine()
    seed(engine)
    monkeypatch.setattr("hashscrap.db.create_database_engine", lambda: engine)

    assert main(["report", "--max-observations", "0"]) == 2

    captured = capsys.readouterr()
    assert captured.out == ""
    assert captured.err.startswith("hashscrap: ")
    engine.dispose()
