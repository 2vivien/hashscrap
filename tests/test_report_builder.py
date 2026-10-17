"""Tests for the read-only report assembly layer.

They use an in-process SQLite database seeded directly through the models: no service, no
PostgreSQL and no network access is required.
"""

from __future__ import annotations

from collections.abc import Iterator
from datetime import UTC, datetime, timedelta
from uuid import UUID

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from hashscrap.models import (
    Base,
    CrawlJob,
    CrawlRun,
    Document,
    Entity,
    EntityObservation,
    EntityRelationship,
    Observation,
)
from hashscrap.models import Source as SourceRow
from hashscrap.report_builder import build_report
from hashscrap.reports import InvestigationReport, render_report_json

STARTED = datetime(2026, 10, 1, 8, 0, tzinfo=UTC)
FINISHED = datetime(2026, 10, 1, 8, 5, tzinfo=UTC)

ALPHA_SOURCE_ID = UUID("11111111-1111-1111-1111-111111111111")
BETA_SOURCE_ID = UUID("22222222-2222-2222-2222-222222222222")
JOB_ID = UUID("33333333-3333-3333-3333-333333333333")
RUN_ID = UUID("44444444-4444-4444-4444-444444444444")
DOCUMENT_ID = UUID("55555555-5555-5555-5555-555555555555")
TITLE_OBSERVATION_ID = UUID("66666666-6666-6666-6666-666666666666")
EMAIL_OBSERVATION_ID = UUID("77777777-7777-7777-7777-777777777777")
ORGANIZATION_ID = UUID("88888888-8888-8888-8888-888888888888")
DOMAIN_ID = UUID("99999999-9999-9999-9999-999999999999")
ENTITY_OBSERVATION_ID = UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
RELATIONSHIP_ID = UUID("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb")


@pytest.fixture
def session() -> Iterator[Session]:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    with Session(engine) as active:
        yield active
    engine.dispose()


def _seed(session: Session) -> None:
    """One source with a failed run and two observations, one source without any run."""
    alpha = SourceRow(
        id=ALPHA_SOURCE_ID,
        source_key="alpha",
        source_type="http",
        base_url="https://alpha.test/",
        enabled=True,
    )
    beta = SourceRow(
        id=BETA_SOURCE_ID,
        source_key="beta",
        source_type="http",
        base_url="https://beta.test/",
        enabled=True,
    )
    session.add_all([alpha, beta])
    session.flush()

    job = CrawlJob(
        id=JOB_ID,
        source_id=alpha.id,
        input_url="https://alpha.test/",
        status="failed",
        attempts=1,
        max_attempts=1,
        idempotency_key="alpha-20261001",
        error_code="http_429",
    )
    session.add(job)
    session.flush()

    run = CrawlRun(
        id=RUN_ID,
        job_id=job.id,
        status="failed",
        started_at=STARTED,
        finished_at=FINISHED,
        fetched_count=3,
        failed_count=1,
    )
    session.add(run)
    session.flush()

    document = Document(
        id=DOCUMENT_ID,
        source_id=alpha.id,
        run_id=run.id,
        original_url="https://alpha.test/company",
        canonical_url="https://alpha.test/company",
        content_sha256="a" * 64,
        status_code=200,
        first_seen_at=STARTED,
        last_seen_at=FINISHED,
    )
    session.add(document)
    session.flush()

    session.add_all(
        [
            Observation(
                id=TITLE_OBSERVATION_ID,
                document_id=document.id,
                source_id=alpha.id,
                run_id=run.id,
                observed_at=STARTED,
                field_name="title",
                raw_value="Alpha Corp",
                normalized_value="Alpha Corp",
                extractor="html",
                extractor_version="1",
                evidence_ref="css:title",
                validation_status="unreviewed",
            ),
            Observation(
                id=EMAIL_OBSERVATION_ID,
                document_id=document.id,
                source_id=alpha.id,
                run_id=run.id,
                observed_at=STARTED,
                field_name="email",
                raw_value="contact@alpha.test",
                normalized_value="contact@alpha.test",
                extractor="html",
                extractor_version="1",
                evidence_ref="css:a.email",
                validation_status="validated",
            ),
        ]
    )

    organization = Entity(
        id=ORGANIZATION_ID,
        entity_type="organization",
        raw_identifier="Alpha Corp",
        normalized_identifier="alpha corp",
        normalization_method="lowercase",
        review_status="unreviewed",
    )
    domain = Entity(
        id=DOMAIN_ID,
        entity_type="domain",
        raw_identifier="alpha.test",
        normalized_identifier="alpha.test",
        normalization_method="lowercase",
        review_status="accepted_exact",
    )
    session.add_all([organization, domain])
    session.flush()

    session.add(
        EntityObservation(
            id=ENTITY_OBSERVATION_ID,
            entity_id=organization.id,
            observation_id=TITLE_OBSERVATION_ID,
            matching_method="exact",
            review_status="unreviewed",
        )
    )
    session.add(
        EntityRelationship(
            id=RELATIONSHIP_ID,
            source_entity_id=organization.id,
            target_entity_id=domain.id,
            relation_type="operates",
            evidence_observation_id=TITLE_OBSERVATION_ID,
            review_status="needs_review",
        )
    )
    session.flush()


def _report(
    session: Session,
    *,
    source_key: str | None = None,
    max_observations: int = 1000,
    max_relationships: int = 1000,
) -> InvestigationReport:
    return build_report(
        session,
        investigation_id="inv-1",
        title="Investigation",
        scope="local persisted evidence",
        source_key=source_key,
        max_observations=max_observations,
        max_relationships=max_relationships,
    )


def test_empty_database_yields_minimal_report(session: Session) -> None:
    report = build_report(
        session, investigation_id="empty", title="Empty", scope="local persisted evidence"
    )
    assert report.sources == []
    assert report.observations == []
    assert report.relationships == []
    assert report.errors == []
    assert report.started_at.tzinfo is not None
    assert report.finished_at is None


def test_mapping_preserves_provenance_and_source_status(session: Session) -> None:
    _seed(session)
    report = _report(session)

    assert [source.source_id for source in report.sources] == ["alpha", "beta"]
    alpha = report.sources[0]
    assert alpha.status == "failed"
    assert alpha.fetched_count == 3
    assert alpha.failed_count == 1
    assert alpha.error_code == "http_429"
    assert alpha.source_url == "https://alpha.test/"
    assert report.sources[1].status == "unavailable"
    assert report.sources[1].error_code is None

    assert [observation.field_name for observation in report.observations] == ["email", "title"]
    title = report.observations[1]
    assert title.observation_id == str(TITLE_OBSERVATION_ID)
    assert title.value == "Alpha Corp"
    assert title.source_id == "alpha"
    assert title.source_url == "https://alpha.test/company"
    assert title.evidence_ref == "css:title"
    assert title.classification == "direct_observation"
    assert title.validation_status == "unreviewed"
    assert report.observations[0].validation_status == "validated"

    assert len(report.relationships) == 1
    relationship = report.relationships[0]
    assert relationship.relationship_id == str(RELATIONSHIP_ID)
    assert relationship.source_entity == "organization:alpha corp"
    assert relationship.target_entity == "domain:alpha.test"
    assert relationship.relation_type == "operates"
    assert relationship.evidence_observation_id == str(TITLE_OBSERVATION_ID)
    assert relationship.evidence_ref == "css:title"
    assert relationship.review_status == "needs_review"

    assert [error.source_id for error in report.errors] == ["alpha"]
    assert report.errors[0].error_code == "http_429"
    assert "https://" not in report.errors[0].message
    assert any("unreviewed" in item for item in report.limitations)
    assert any("beta" in item for item in report.limitations)


def test_source_filter_scopes_sources_observations_and_relationships(session: Session) -> None:
    _seed(session)
    report = _report(session, source_key="alpha")

    assert [source.source_id for source in report.sources] == ["alpha"]
    assert {observation.source_id for observation in report.observations} == {"alpha"}
    assert len(report.relationships) == 1
    assert any("alpha" in item and "périmètre" in item for item in report.limitations)

    unknown = _report(session, source_key="does-not-exist")
    assert unknown.sources == []
    assert unknown.observations == []
    assert unknown.relationships == []


def test_limits_bound_collections_and_report_truncation(session: Session) -> None:
    _seed(session)
    report = _report(session, max_observations=1, max_relationships=1)

    assert len(report.observations) == 1
    assert len(report.relationships) == 1
    assert any("tronquées" in item for item in report.limitations)
    assert any("relations tronquées" in item for item in report.limitations)


def test_non_positive_limits_are_rejected(session: Session) -> None:
    with pytest.raises(ValueError):
        _report(session, max_observations=0)
    with pytest.raises(ValueError):
        _report(session, max_relationships=0)


def test_rendering_is_deterministic_across_calls(session: Session) -> None:
    _seed(session)
    first = render_report_json(_report(session))
    second = render_report_json(_report(session))
    assert first == second


def test_timestamps_are_reported_as_utc(session: Session) -> None:
    _seed(session)
    report = _report(session)

    assert report.started_at == STARTED
    assert report.finished_at == FINISHED
    assert report.started_at.utcoffset() == timedelta(0)
    assert report.finished_at is not None
    assert report.finished_at.utcoffset() == timedelta(0)
