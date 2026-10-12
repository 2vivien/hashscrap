from __future__ import annotations

from datetime import UTC, datetime

import pytest
from pydantic import ValidationError

from hashscrap.reports import (
    InvestigationReport,
    ReportObservation,
    ReportRelationship,
    ReportSource,
    render_report_json,
    render_report_markdown,
)


def _report() -> InvestigationReport:
    instant = datetime(2026, 1, 1, tzinfo=UTC)
    return InvestigationReport(
        investigation_id="inv-1",
        title="Example investigation",
        scope="https://example.test/",
        started_at=instant,
        sources=[
            ReportSource(
                source_id="source-a",
                source_name="Example",
                source_url="https://example.test/",
                status="partial",
                fetched_count=2,
                failed_count=1,
                error_code="http_429",
            )
        ],
        observations=[
            ReportObservation(
                observation_id="obs-1",
                field_name="title",
                value="Example",
                source_id="source-a",
                source_url="https://example.test/",
                observed_at=instant,
                evidence_ref="css:title",
                classification="direct_observation",
            )
        ],
        relationships=[
            ReportRelationship(
                relationship_id="rel-1",
                source_entity="example.test",
                relation_type="hosts",
                target_entity="8.8.8.8",
                evidence_observation_id="obs-1",
                evidence_ref="css:a[href]:0",
                review_status="needs_review",
            )
        ],
        limitations=["Partial collection", "No exhaustive coverage claim"],
    )


def test_json_report_is_deterministic_and_versioned() -> None:
    report = _report()
    assert render_report_json(report) == render_report_json(report)
    assert '"schema_version": "1.0"' in render_report_json(report)


def test_markdown_report_preserves_evidence_and_coverage_errors() -> None:
    markdown = render_report_markdown(_report())
    assert "css:title" in markdown
    assert "obs-1" in markdown
    assert "http_429" in markdown
    assert "Partial collection" in markdown
    assert "ne prouve pas une couverture exhaustive" in markdown


def test_relationship_without_evidence_is_rejected() -> None:
    with pytest.raises(ValidationError):
        ReportRelationship(
            relationship_id="rel-1",
            source_entity="a",
            relation_type="links_to",
            target_entity="b",
            evidence_observation_id="",
            evidence_ref="",
            review_status="unreviewed",
        )


def test_empty_report_states_missing_data_without_inventing() -> None:
    report = InvestigationReport(
        investigation_id="empty",
        title="Empty",
        scope="No scope",
        started_at=datetime(2026, 1, 1, tzinfo=UTC),
    )
    markdown = render_report_markdown(report)
    assert "Aucune observation disponible." in markdown
    assert "Aucune source enregistrée" in markdown
    assert "Les limites supplémentaires ne sont pas renseignées." in markdown
