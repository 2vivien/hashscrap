"""Deterministic demonstration dataset for the local environment.

The seed populates the tables the API reads with the same scenario as the
design reference. Every row is explicitly marked as demonstration data so it
can never be mistaken for a real collection.

Usage:

    python -m hashscrap.seed
"""

from __future__ import annotations

import argparse
import hashlib
from datetime import UTC, datetime, timedelta
from typing import TypedDict

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from hashscrap.db import create_database_engine
from hashscrap.models import (
    AuditEvent,
    CrawlJob,
    CrawlRun,
    Document,
    EngineSetting,
    Entity,
    EntityObservation,
    EntityRelationship,
    Investigation,
    InvestigationItem,
    Observation,
    Report,
    Source,
)

DEMO_MARKER = "demo"


class SourceSeed(TypedDict):
    source_key: str
    source_type: str
    base_url: str
    enabled: bool
    allowed_hosts: list[str]


class CollecteSeed(TypedDict):
    reference: str
    source: str
    status: str
    target_pages: int
    fetched: int
    failed: int
    started: str
    duration: int


class DocumentSeed(TypedDict):
    url: str
    source: str
    sha256: str | None
    bytes: int
    seen: str


class EntitySeed(TypedDict):
    raw: str
    normalized: str
    type: str
    method: str
    review: str
    observations: int
    detected: str


class InvestigationSeed(TypedDict):
    name: str
    description: str
    status: str
    sources: int
    observations: int


class ReportSeed(TypedDict):
    title: str
    investigation: str
    status: str
    format: str
    generated: str


def _demo_digest(prefix: str, url: str) -> str:
    """Build a 64 character demonstration digest from a readable prefix."""
    return f"{prefix}{hashlib.sha256(url.encode('utf-8')).hexdigest()[: 64 - len(prefix)]}"


SOURCES: list[SourceSeed] = [
    {
        "source_key": "techcorp.io",
        "source_type": "web",
        "base_url": "https://techcorp.io",
        "enabled": True,
        "allowed_hosts": ["techcorp.io", "www.techcorp.io"],
    },
    {
        "source_key": "api.github.com",
        "source_type": "api",
        "base_url": "https://api.github.com/orgs/techcorp",
        "enabled": True,
        "allowed_hosts": ["api.github.com"],
    },
    {
        "source_key": "darkforum.net",
        "source_type": "reseau",
        "base_url": "https://darkforum.net/tech",
        "enabled": True,
        "allowed_hosts": ["darkforum.net"],
    },
    {
        "source_key": "linkedin.com",
        "source_type": "web",
        "base_url": "https://linkedin.com/company/techcorp",
        "enabled": True,
        "allowed_hosts": ["linkedin.com"],
    },
    {
        "source_key": "api.shodan.io",
        "source_type": "api",
        "base_url": "https://api.shodan.io",
        "enabled": True,
        "allowed_hosts": ["api.shodan.io"],
    },
    {
        "source_key": "pastebin.com",
        "source_type": "web",
        "base_url": "https://pastebin.com/u/techcorp",
        "enabled": True,
        "allowed_hosts": ["pastebin.com"],
    },
]

COLLECTES: list[CollecteSeed] = [
    {
        "reference": "C-2025-0423-001",
        "source": "techcorp.io",
        "status": "running",
        "target_pages": 3500,
        "fetched": 1248,
        "failed": 0,
        "started": "2025-05-12T14:23:00Z",
        "duration": 4320,
    },
    {
        "reference": "C-2025-0422-014",
        "source": "api.github.com",
        "status": "succeeded",
        "target_pages": 3420,
        "fetched": 3420,
        "failed": 0,
        "started": "2025-05-12T09:11:00Z",
        "duration": 7440,
    },
    {
        "reference": "C-2025-0421-009",
        "source": "darkforum.net",
        "status": "failed",
        "target_pages": 890,
        "fetched": 534,
        "failed": 356,
        "started": "2025-05-11T22:40:00Z",
        "duration": 2580,
    },
    {
        "reference": "C-2025-0420-003",
        "source": "linkedin.com",
        "status": "succeeded",
        "target_pages": 2103,
        "fetched": 2103,
        "failed": 0,
        "started": "2025-05-10T16:02:00Z",
        "duration": 6900,
    },
    {
        "reference": "C-2025-0419-011",
        "source": "api.shodan.io",
        "status": "succeeded",
        "target_pages": 1560,
        "fetched": 1560,
        "failed": 0,
        "started": "2025-05-09T11:33:00Z",
        "duration": 3120,
    },
]

DOCUMENTS: list[DocumentSeed] = [
    {
        "url": "https://techcorp.io/team/john-doe",
        "source": "techcorp.io",
        "sha256": _demo_digest("a1b2c3d4e5f6", "https://techcorp.io/team/john-doe"),
        "bytes": 43315,
        "seen": "2025-05-12T14:28:00Z",
    },
    {
        "url": "https://github.com/techcorp/api",
        "source": "api.github.com",
        "sha256": _demo_digest("f6e5d4c3b2a1", "https://github.com/techcorp/api"),
        "bytes": 52428,
        "seen": "2025-05-12T09:15:00Z",
    },
    {
        "url": "https://linkedin.com/in/johndoe",
        "source": "linkedin.com",
        "sha256": _demo_digest("9a8b7c6d5e4f", "https://linkedin.com/in/johndoe"),
        "bytes": 23107,
        "seen": "2025-05-10T16:10:00Z",
    },
    {
        "url": "https://pastebin.com/xyz123",
        "source": "pastebin.com",
        "sha256": None,
        "bytes": 8842,
        "seen": "2025-05-08T18:44:00Z",
    },
]

ENTITIES: list[EntitySeed] = [
    {
        "raw": "john.doe@company.com",
        "normalized": "john.doe@company.com",
        "type": "email",
        "method": "email_lowercase",
        "review": "accepted_exact",
        "observations": 42,
        "detected": "2025-05-12T14:22:00Z",
    },
    {
        "raw": "192.168.14.22",
        "normalized": "192.168.14.22",
        "type": "ip",
        "method": "ipaddress_compressed",
        "review": "needs_review",
        "observations": 18,
        "detected": "2025-05-12T13:10:00Z",
    },
    {
        "raw": "techcorp.io",
        "normalized": "techcorp.io",
        "type": "domain",
        "method": "domain_idna_lowercase",
        "review": "accepted_exact",
        "observations": 67,
        "detected": "2025-05-12T12:45:00Z",
    },
    {
        "raw": "John Doe",
        "normalized": "john doe",
        "type": "personne",
        "method": "organization_name_casefold",
        "review": "unreviewed",
        "observations": 29,
        "detected": "2025-05-11T19:30:00Z",
    },
    {
        "raw": "+33 6 12 34 56 78",
        "normalized": "+33612345678",
        "type": "telephone",
        "method": "telephone_e164",
        "review": "needs_review",
        "observations": 7,
        "detected": "2025-05-10T09:15:00Z",
    },
    {
        "raw": "a1b2c3d4e5f6",
        "normalized": "a1b2c3d4e5f6",
        "type": "hash",
        "method": "hash_lowercase",
        "review": "accepted_exact",
        "observations": 12,
        "detected": "2025-05-09T16:00:00Z",
    },
]

RELATIONS: list[tuple[str, str, str]] = [
    ("techcorp.io", "John Doe", "domaine employeur"),
    ("192.168.14.22", "techcorp.io", "dernière IP"),
    ("John Doe", "john.doe@company.com", "identité"),
    ("+33 6 12 34 56 78", "John Doe", "téléphone pro"),
]

INVESTIGATIONS: list[InvestigationSeed] = [
    {
        "name": "Opération TechLeak",
        "description": "Fuite de données clients Q1 2025",
        "status": "en_cours",
        "sources": 3,
        "observations": 1242,
    },
    {
        "name": "Veille Concurrentielle",
        "description": "Monitoring TechCorp vs Rivaux",
        "status": "terminee",
        "sources": 5,
        "observations": 892,
    },
    {
        "name": "Cartographie infra",
        "description": "Mapping surface d'attaque externe",
        "status": "en_cours",
        "sources": 2,
        "observations": 2103,
    },
    {
        "name": "Phishing Kit Tracker",
        "description": "Suivi kits phishing imitant TechCorp",
        "status": "en_attente",
        "sources": 1,
        "observations": 334,
    },
]

REPORTS: list[ReportSeed] = [
    {
        "title": "Rapport TechLeak Q1 – v4",
        "investigation": "Opération TechLeak",
        "status": "validee",
        "format": "pdf",
        "generated": "2025-05-12T15:00:00Z",
    },
    {
        "title": "Cartographie infra externe",
        "investigation": "Cartographie infra",
        "status": "en_attente",
        "format": "markdown",
        "generated": "2025-05-10T11:20:00Z",
    },
    {
        "title": "Veille concurrentielle hebdo",
        "investigation": "Veille Concurrentielle",
        "status": "validee",
        "format": "pdf",
        "generated": "2025-05-09T09:00:00Z",
    },
]

SETTINGS: dict[str, dict[str, object]] = {
    "collecteur": {
        "requests_per_second": 2.5,
        "depth": 4,
        "max_pages": 5000,
        "timeout": 30,
    },
    "reseau": {
        "proxy": "socks5://10.0.0.5:1080",
        "user_agent_rotation": True,
        "robots_txt": "strict",
    },
    "conservation": {
        "preuves": "90 jours",
        "auto_suppression_logs": "Activé • 30 jours",
    },
    "securite": {
        "reset_warning": (
            "La réinitialisation supprime toutes les collectes et preuves. Action irréversible."
        )
    },
}

AUDIT_EVENTS: list[tuple[str, str, str, str]] = [
    ("2025-05-12T14:23:00Z", "info", "Collecte C-2025-0423-001 start", "collectes"),
    ("2025-05-12T14:24:00Z", "debug", "Sitemap parsed 42 urls", "collectes"),
    ("2025-05-12T14:26:00Z", "warn", "Rate limit 429", "collectes"),
    ("2025-05-12T14:28:00Z", "info", "Page saved /team", "documents"),
]


def _parse(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(UTC)


def _source(session: Session, key: str) -> Source | None:
    return session.scalar(select(Source).where(Source.source_key == key))


def seed_sources(session: Session) -> dict[str, Source]:
    created: dict[str, Source] = {}
    for payload in SOURCES:
        key = str(payload["source_key"])
        source = _source(session, key)
        if source is None:
            source = Source(
                source_key=key,
                source_type=str(payload["source_type"]),
                base_url=str(payload["base_url"]),
                enabled=bool(payload["enabled"]),
                policy_config={
                    "allowed_hosts": list(payload["allowed_hosts"]),
                    "name": key,
                    "demo": DEMO_MARKER,
                },
            )
            session.add(source)
            session.flush()
        created[key] = source
    return created


def seed_collectes(session: Session, sources: dict[str, Source]) -> dict[str, CrawlJob]:
    created: dict[str, CrawlJob] = {}
    for payload in COLLECTES:
        reference = str(payload["reference"])
        job = session.scalar(select(CrawlJob).where(CrawlJob.reference == reference))
        if job is None:
            job = CrawlJob(
                reference=reference,
                input_url=f"https://{payload['source']}",
                source_id=sources[str(payload["source"])].id,
                status=str(payload["status"]),
                attempts=1,
                max_attempts=3,
                idempotency_key=f"demo:{reference}",
                target_pages=payload["target_pages"],
            )
            session.add(job)
            session.flush()
        started = _parse(str(payload["started"]))
        finished = started + timedelta(seconds=payload["duration"])
        run = session.scalar(select(CrawlRun).where(CrawlRun.job_id == job.id))
        if run is None:
            run = CrawlRun(
                job_id=job.id,
                status="running" if job.status == "running" else job.status,
                started_at=started,
                finished_at=None if job.status == "running" else finished,
                fetched_count=payload["fetched"],
                failed_count=payload["failed"],
                bytes_received=payload["fetched"] * 4096,
                config_snapshot={"demo": DEMO_MARKER},
            )
            session.add(run)
        created[reference] = job
    return created


def seed_documents(
    session: Session,
    sources: dict[str, Source],
    jobs: dict[str, CrawlJob],
) -> list[Document]:
    documents: list[Document] = []
    for payload in DOCUMENTS:
        source = sources[str(payload["source"])]
        job = next((item for item in jobs.values() if item.source_id == source.id), None)
        run = (
            session.scalar(select(CrawlRun).where(CrawlRun.job_id == job.id))
            if job is not None
            else None
        )
        existing = session.scalar(
            select(Document).where(Document.original_url == str(payload["url"]))
        )
        if existing is not None:
            documents.append(existing)
            continue
        document = Document(
            source_id=source.id,
            run_id=run.id if run is not None else None,
            original_url=str(payload["url"]),
            canonical_url=str(payload["url"]),
            content_sha256=payload["sha256"],
            content_bytes=payload["bytes"],
            media_type="text/html",
            status_code=200,
            first_seen_at=_parse(str(payload["seen"])),
            last_seen_at=_parse(str(payload["seen"])),
        )
        session.add(document)
        session.flush()
        documents.append(document)
    return documents


def seed_entities(session: Session) -> dict[str, Entity]:
    created: dict[str, Entity] = {}
    for payload in ENTITIES:
        raw = str(payload["raw"])
        entity = session.scalar(select(Entity).where(Entity.raw_identifier == raw))
        if entity is None:
            entity = Entity(
                entity_type=str(payload["type"]),
                raw_identifier=raw,
                normalized_identifier=str(payload["normalized"]),
                normalization_method=str(payload["method"]),
                review_status=str(payload["review"]),
                created_at=_parse(str(payload["detected"])),
            )
            session.add(entity)
            session.flush()
        created[raw] = entity
    return created


def seed_observations(
    session: Session,
    entities: dict[str, Entity],
    documents: list[Document],
) -> list[Observation]:
    observations: list[Observation] = []
    for index, (entity_key, document) in enumerate(zip(entities, documents, strict=False)):
        entity = entities[entity_key]
        existing = session.scalar(
            select(EntityObservation).where(
                EntityObservation.entity_id == entity.id,
            )
        )
        observation = Observation(
            document_id=document.id,
            source_id=document.source_id,
            run_id=document.run_id,
            observed_at=document.first_seen_at,
            field_name=entity.entity_type,
            raw_value=entity.raw_identifier,
            normalized_value=entity.normalized_identifier,
            extractor="hashscrap-html",
            extractor_version="1",
            evidence_ref=f"css:a[href]:{index}",
            validation_status="validated"
            if entity.review_status == "accepted_exact"
            else "unreviewed",
        )
        session.add(observation)
        session.flush()
        observations.append(observation)
        if existing is None:
            session.add(
                EntityObservation(
                    entity_id=entity.id,
                    observation_id=observation.id,
                    matching_method=entity.normalization_method,
                    review_status=entity.review_status,
                )
            )
    return observations


def seed_relations(
    session: Session,
    entities: dict[str, Entity],
    observations: list[Observation],
) -> None:
    for source_key, target_key, relation_type in RELATIONS:
        if source_key not in entities or target_key not in entities:
            continue
        existing = session.scalar(
            select(EntityRelationship).where(
                EntityRelationship.source_entity_id == entities[source_key].id,
                EntityRelationship.target_entity_id == entities[target_key].id,
            )
        )
        if existing is not None:
            continue
        evidence = observations[0] if observations else None
        if evidence is None:
            continue
        session.add(
            EntityRelationship(
                source_entity_id=entities[source_key].id,
                target_entity_id=entities[target_key].id,
                relation_type=relation_type,
                evidence_observation_id=evidence.id,
                review_status="needs_review",
            )
        )


def seed_investigations(
    session: Session,
    jobs: dict[str, CrawlJob],
) -> list[Investigation]:
    created: list[Investigation] = []
    for payload in INVESTIGATIONS:
        name = str(payload["name"])
        investigation = session.scalar(select(Investigation).where(Investigation.name == name))
        if investigation is None:
            investigation = Investigation(
                name=name,
                description=str(payload["description"]),
                status=str(payload["status"]),
            )
            session.add(investigation)
            session.flush()
        for job in list(jobs.values())[: payload["sources"]]:
            session.add(
                InvestigationItem(
                    investigation_id=investigation.id,
                    job_id=job.id,
                )
            )
        created.append(investigation)
    return created


def seed_reports(session: Session, investigations: list[Investigation]) -> None:
    by_name = {investigation.name: investigation for investigation in investigations}
    for payload in REPORTS:
        title = str(payload["title"])
        existing = session.scalar(select(Report).where(Report.title == title))
        if existing is not None:
            continue
        investigation = by_name.get(str(payload["investigation"]))
        session.add(
            Report(
                investigation_id=investigation.id if investigation else None,
                title=title,
                status=str(payload["status"]),
                format=str(payload["format"]),
                content=(
                    f"# {title}\n\n"
                    "## Résumé exécutif\n\n"
                    "Document de démonstration généré par le script de seed.\n"
                ),
                generated_at=_parse(str(payload["generated"])),
            )
        )


def seed_settings(session: Session) -> None:
    for key, value in SETTINGS.items():
        setting = session.get(EngineSetting, key)
        if setting is None:
            session.add(EngineSetting(key=key, value=value))
        else:
            setting.value = value


def seed_audit_events(session: Session) -> None:
    if session.scalar(select(AuditEvent).limit(1)) is not None:
        return
    for occurred_at, level, message, resource in AUDIT_EVENTS:
        session.add(
            AuditEvent(
                actor=DEMO_MARKER,
                action=level,
                resource=f"{message} ({resource})",
                occurred_at=_parse(occurred_at),
                details={"demo": DEMO_MARKER},
            )
        )


def seed_all(session: Session) -> None:
    """Populate every table the API reads."""
    sources = seed_sources(session)
    jobs = seed_collectes(session, sources)
    documents = seed_documents(session, sources, jobs)
    entities = seed_entities(session)
    observations = seed_observations(session, entities, documents)
    seed_relations(session, entities, observations)
    investigations = seed_investigations(session, jobs)
    seed_reports(session, investigations)
    seed_settings(session)
    seed_audit_events(session)
    session.commit()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Seed the HashScrap demonstration dataset")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="delete the demonstration rows before seeding them again",
    )
    args = parser.parse_args(argv)

    engine = create_database_engine()
    try:
        with Session(engine) as session:
            if args.reset:
                for model in (
                    EntityRelationship,
                    EntityObservation,
                    Observation,
                    Document,
                    CrawlRun,
                    CrawlJob,
                    Report,
                    InvestigationItem,
                    Investigation,
                    Entity,
                    AuditEvent,
                    EngineSetting,
                    Source,
                ):
                    session.execute(delete(model))
                session.commit()
            seed_all(session)
    finally:
        engine.dispose()
    print("hashscrap: demonstration dataset seeded")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
