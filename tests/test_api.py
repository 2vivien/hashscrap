"""Unit tests for the API payload builders.

They never touch a database: the builders take model instances and return
validated payloads.
"""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

from fastapi.testclient import TestClient

from hashscrap.api.app import create_app
from hashscrap.api.serializers import (
    activity_out,
    collecte_out,
    duration_label,
    entity_out,
    evidence_out,
    investigation_out,
    progress_label,
    report_out,
    source_label,
    source_out,
    timeline_event_out,
)
from hashscrap.models import (
    CrawlJob,
    CrawlRun,
    Document,
    Entity,
    Investigation,
    Report,
    Source,
)


def _source(**overrides: object) -> Source:
    payload: dict[str, object] = {
        "id": uuid4(),
        "source_key": "techcorp.io",
        "source_type": "web",
        "base_url": "https://techcorp.io",
        "policy_config": {"name": "TechCorp Primary", "allowed_hosts": ["techcorp.io"]},
        "enabled": True,
    }
    payload.update(overrides)
    return Source(**payload)


def _job(**overrides: object) -> CrawlJob:
    payload: dict[str, object] = {
        "id": uuid4(),
        "source_id": uuid4(),
        "input_url": "https://techcorp.io",
        "reference": "C-2025-0423-001",
        "status": "running",
        "attempts": 1,
        "max_attempts": 3,
        "idempotency_key": "demo:C-2025-0423-001",
        "target_pages": 3500,
    }
    payload.update(overrides)
    return CrawlJob(**payload)


def _run(job: CrawlJob, **overrides: object) -> CrawlRun:
    payload: dict[str, object] = {
        "id": uuid4(),
        "job_id": job.id,
        "status": "running",
        "started_at": datetime(2025, 5, 12, 14, 23, tzinfo=UTC),
        "finished_at": None,
        "fetched_count": 1248,
        "failed_count": 0,
        "bytes_received": 1024,
        "config_snapshot": {},
    }
    payload.update(overrides)
    return CrawlRun(**payload)


def test_duration_label_formats_hours_and_minutes() -> None:
    assert duration_label(4320) == "1h12m"
    assert duration_label(0) == "0h00m"
    assert duration_label(-5) == "0h00m"


def test_source_label_prefers_the_configured_name() -> None:
    assert source_label(_source()) == "TechCorp Primary"
    assert source_label(_source(policy_config={})) == "techcorp.io"
    assert source_label(None) == "inconnu"


def test_progress_is_a_share_of_the_configured_target() -> None:
    job = _job()
    assert progress_label(_job(status="succeeded"), None) == 100
    assert progress_label(job, _run(job)) == 35
    assert progress_label(job, None) == 0
    assert progress_label(_job(target_pages=0, status="running"), None) == 0


def test_collecte_payload_maps_the_engine_status() -> None:
    job = _job()
    payload = collecte_out(job, _run(job), _source())
    assert payload.id == "C-2025-0423-001"
    assert payload.status == "en_cours"
    assert payload.type == "web"
    assert payload.progress == 35
    assert payload.pages == 1248
    assert payload.duration == "0h00m"


def test_collecte_payload_falls_back_to_the_job_uuid() -> None:
    job = _job(reference=None)
    payload = collecte_out(job, None, None)
    assert payload.id == str(job.id)
    assert payload.source == "inconnu"
    assert payload.status == "en_cours"


def test_source_payload_exposes_the_allowed_domains() -> None:
    payload = source_out(_source(), "validee", datetime(2025, 5, 12, 14, 23, tzinfo=UTC))
    assert payload.nom == "TechCorp Primary"
    assert payload.url == "https://techcorp.io"
    assert payload.statut == "validee"
    assert payload.domaines == ["techcorp.io"]
    assert payload.derniere_collecte is not None


def test_entity_confidence_is_derived_from_the_review_status() -> None:
    entity = Entity(
        id=uuid4(),
        entity_type="email",
        raw_identifier="john.doe@company.com",
        normalized_identifier="john.doe@company.com",
        normalization_method="email_lowercase",
        review_status="accepted_exact",
    )
    payload = entity_out(entity, 42, datetime(2025, 5, 12, 14, 22, tzinfo=UTC))
    assert payload.type == "email"
    assert payload.confiance == "elevee"
    assert payload.observations == 42


def test_evidence_payload_reports_the_size_and_the_status() -> None:
    document = Document(
        id=uuid4(),
        original_url="https://techcorp.io/team/john-doe",
        canonical_url="https://techcorp.io/team/john-doe",
        content_sha256="a" * 64,
        content_bytes=43315,
        status_code=200,
        first_seen_at=datetime(2025, 5, 12, 14, 28, tzinfo=UTC),
    )
    payload = evidence_out(document, "techcorp.io")
    assert payload.statut == "validee"
    assert payload.taille == 43315
    assert payload.sha256.startswith("aaaa")

    without_hash = Document(
        id=uuid4(),
        original_url="https://pastebin.com/xyz123",
        content_sha256=None,
        content_bytes=8842,
        status_code=200,
        first_seen_at=datetime(2025, 5, 8, 18, 44, tzinfo=UTC),
    )
    assert evidence_out(without_hash, "pastebin.com").statut == "en_attente"


def test_investigation_and_report_payloads() -> None:
    investigation = Investigation(
        id=uuid4(),
        name="Opération TechLeak",
        description="Fuite de données clients Q1 2025",
        status="en_cours",
    )
    payload = investigation_out(investigation, 3, 1242)
    assert payload.nom == "Opération TechLeak"
    assert payload.sources == 3
    assert payload.observations == 1242

    report = Report(
        id=uuid4(),
        title="Rapport TechLeak Q1 – v4",
        status="validee",
        format="pdf",
        content="# Rapport",
        generated_at=datetime(2025, 5, 12, 15, 0, tzinfo=UTC),
    )
    report_payload = report_out(report, "Opération TechLeak")
    assert report_payload.investigation == "Opération TechLeak"
    assert report_payload.format == "pdf"


def test_timeline_and_activity_payloads() -> None:
    event = timeline_event_out(
        "id",
        datetime(2025, 5, 12, 14, 23, tzinfo=UTC),
        "collecte",
        "C-2025-0423-001 démarrée",
        "techcorp.io",
    )
    assert event.date == "2025-05-12"
    assert event.heure == "14:23"

    activity = activity_out("id", datetime(2025, 5, 12, 14, 23, tzinfo=UTC), "collecte", "x", "y")
    assert activity.type == "collecte"


def test_health_endpoint_answers_without_a_database() -> None:
    client = TestClient(create_app())
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] in {"ok", "degraded"}
    assert "version" in body


def test_openapi_document_exposes_the_versioned_routes() -> None:
    client = TestClient(create_app())
    document = client.get("/api/v1/openapi.json").json()
    paths = {path for path in document["paths"] if path.startswith("/api/v1/")}
    assert "/api/v1/collectes" in paths
    assert "/api/v1/sources" in paths
    assert "/api/v1/entites" in paths
    assert "/api/v1/chronologie" in paths
    assert "/api/v1/preuves" in paths
    assert "/api/v1/rapports" in paths
    assert "/api/v1/parametres" in paths
    assert "/api/v1/dashboard" in paths
