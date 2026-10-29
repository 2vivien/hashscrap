"""Pure mapping helpers from persisted rows to API payloads.

These functions take model instances and never touch the database, so they can
be unit tested without a running PostgreSQL instance.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from hashscrap.api.schemas import (
    ActivityOut,
    AutoSuppressionSettingsOut,
    CollecteDetailOut,
    CollecteErrorOut,
    CollecteEventOut,
    CollecteObservationsOut,
    CollecteOut,
    CollectorSettingsOut,
    Confidence,
    EntityDetailOut,
    EntityObservationOut,
    EntityOut,
    EntityRelationOut,
    EntityType,
    EvidenceOut,
    InvestigationOut,
    NetworkSettingsOut,
    ReportOut,
    RetentionSettingsOut,
    SecuritySettingsOut,
    SourceOut,
    SourceStatus,
    StatOut,
    TimelineEventOut,
)
from hashscrap.models import (
    CrawlJob,
    CrawlRun,
    Document,
    Entity,
    EntityRelationship,
    Investigation,
    Observation,
    Report,
    Source,
)

JOB_STATUS_TO_API: dict[str, str] = {
    "queued": "en_attente",
    "running": "en_cours",
    "succeeded": "terminee",
    "failed": "echouee",
    "cancelled": "annulee",
}

REVIEW_STATUS_TO_CONFIDENCE: dict[str, Confidence] = {
    "accepted_exact": "elevee",
    "needs_review": "moyenne",
    "unreviewed": "faible",
    "rejected": "faible",
}

ENTITY_TYPE_TO_API: dict[str, EntityType] = {
    "email": "email",
    "domain": "domaine",
    "ip": "ip",
    "organization": "personne",
    "personne": "personne",
    "telephone": "telephone",
    "hash": "hash",
    "url": "domaine",
}


def duration_label(seconds: float) -> str:
    """Format a duration the way the interface displays it (1h12m)."""
    total = max(int(seconds), 0)
    hours, remainder = divmod(total, 3600)
    minutes = remainder // 60
    return f"{hours}h{minutes:02d}m"


def _utc(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def job_reference(job: CrawlJob) -> str:
    return job.reference or str(job.id)


def source_label(source: Source | None) -> str:
    if source is None:
        return "inconnu"
    name = source.policy_config.get("name") if source.policy_config else None
    if isinstance(name, str) and name:
        return name
    return source.source_key


def source_type_label(source: Source | None) -> str:
    if source is None:
        return "web"
    raw = (source.source_type or "web").lower()
    if raw in {"api", "reseau", "network"}:
        return "reseau" if raw == "network" else raw
    return "web"


def progress_label(job: CrawlJob, run: CrawlRun | None) -> int:
    """Progress is a share of the configured page target, never an estimate."""
    if job.status == "succeeded":
        return 100
    if run is None:
        return 0
    target = job.target_pages or 0
    if target <= 0:
        return 100 if job.status == "succeeded" else 0
    return min(int(run.fetched_count * 100 / target), 99)


def collecte_out(
    job: CrawlJob,
    run: CrawlRun | None,
    source: Source | None,
) -> CollecteOut:
    started = _utc(run.started_at) if run else _utc(job.created_at)
    duration = "0h00m"
    if run is not None and run.started_at is not None and run.finished_at is not None:
        duration = duration_label((run.finished_at - run.started_at).total_seconds())
    return CollecteOut(
        id=job_reference(job),
        source=source_label(source),
        type=source_type_label(source),  # type: ignore[arg-type]
        status=JOB_STATUS_TO_API.get(job.status, "en_attente"),  # type: ignore[arg-type]
        progress=progress_label(job, run),
        pages=run.fetched_count if run else 0,
        duration=duration,
        started_at=started or datetime.now(UTC),
    )


def collecte_detail_out(
    job: CrawlJob,
    run: CrawlRun | None,
    source: Source | None,
    observations: list[Observation],
    erreurs: list[CollecteErrorOut],
    evenements: list[CollecteEventOut],
) -> CollecteDetailOut:
    base = collecte_out(job, run, source)
    validated = sum(1 for item in observations if item.validation_status == "validated")
    rejected = sum(1 for item in observations if item.validation_status == "rejected")
    return CollecteDetailOut(
        **base.model_dump(),
        observations=CollecteObservationsOut(
            total=len(observations), validated=validated, rejected=rejected
        ),
        erreurs=erreurs,
        evenements=evenements,
    )


def source_out(
    source: Source,
    statut: SourceStatus,
    derniere_collecte: datetime | None = None,
) -> SourceOut:
    domains = []
    if source.policy_config:
        hosts = source.policy_config.get("allowed_hosts")
        if isinstance(hosts, list):
            domains = [str(host) for host in hosts]
    return SourceOut(
        id=source.source_key,
        nom=source_label(source),
        url=source.base_url or "",
        type=source_type_label(source),  # type: ignore[arg-type]
        statut=statut,
        derniere_collecte=_utc(derniere_collecte),
        domaines=domains,
    )


def investigation_out(
    investigation: Investigation,
    sources: int,
    observations: int,
) -> InvestigationOut:
    return InvestigationOut(
        id=str(investigation.id),
        nom=investigation.name,
        description=investigation.description,
        statut=investigation.status,  # type: ignore[arg-type]
        sources=sources,
        observations=observations,
        derniere_activite=_utc(investigation.updated_at) or datetime.now(UTC),
    )


def entity_out(
    entity: Entity,
    observations: int,
    derniere_detection: datetime | None = None,
) -> EntityOut:
    return EntityOut(
        id=str(entity.id),
        valeur=entity.raw_identifier,
        type=ENTITY_TYPE_TO_API.get(entity.entity_type, "domaine"),
        observations=observations,
        confiance=REVIEW_STATUS_TO_CONFIDENCE.get(entity.review_status, "faible"),
        derniere_detection=_utc(derniere_detection) or _utc(entity.created_at) or datetime.now(UTC),
    )


def entity_observation_out(observation: Observation) -> EntityObservationOut:
    return EntityObservationOut(
        id=str(observation.id),
        champ=observation.field_name,
        valeur_brute=observation.raw_value,
        valeur_normalisee=observation.normalized_value,
        extracteur=observation.extractor,
        version_extracteur=observation.extractor_version,
        evidence_ref=observation.evidence_ref,
        validation_status=observation.validation_status,  # type: ignore[arg-type]
    )


def entity_relation_out(
    relation: EntityRelationship,
    target: Entity,
    libelle: str,
) -> EntityRelationOut:
    return EntityRelationOut(
        id=str(relation.id),
        cible=target.raw_identifier,
        type=relation.relation_type,
        libelle=libelle,
    )


def entity_detail_out(
    entity: Entity,
    observations: list[EntityObservationOut],
    relations: list[EntityRelationOut],
    sources: list[str],
    derniere_detection: datetime | None = None,
) -> EntityDetailOut:
    base = entity_out(entity, len(observations), derniere_detection)
    return EntityDetailOut(
        **base.model_dump(),
        observations_liste=observations,
        relations=relations,
        sources=sources,
    )


def evidence_out(document: Document, source_name: str) -> EvidenceOut:
    sha256 = document.content_sha256 or ""
    statut: str = "validee" if sha256 else "en_attente"
    size = document.content_bytes or 0
    return EvidenceOut(
        id=str(document.id),
        url=document.original_url,
        source=source_name,
        collectee_le=_utc(document.first_seen_at) or datetime.now(UTC),
        sha256=sha256,
        statut=statut,  # type: ignore[arg-type]
        taille=size,
        apercu_url=document.canonical_url or document.original_url,
    )


def report_out(report: Report, investigation_name: str) -> ReportOut:
    return ReportOut(
        id=str(report.id),
        titre=report.title,
        investigation=investigation_name,
        statut=report.status,  # type: ignore[arg-type]
        genere_le=_utc(report.generated_at) or datetime.now(UTC),
        format=report.format,  # type: ignore[arg-type]
        contenu=report.content,
    )


def timeline_event_out(
    event_id: str,
    moment: datetime,
    event_type: str,
    titre: str,
    description: str,
    source: str = "",
) -> TimelineEventOut:
    local = _utc(moment) or datetime.now(UTC)
    return TimelineEventOut(
        id=event_id,
        at=local,
        date=local.date().isoformat(),
        heure=local.strftime("%H:%M"),
        type=event_type,  # type: ignore[arg-type]
        titre=titre,
        description=description,
        source=source,
    )


def activity_out(
    activity_id: str,
    moment: datetime,
    activity_type: str,
    titre: str,
    detail: str,
) -> ActivityOut:
    return ActivityOut(
        id=activity_id,
        type=activity_type,  # type: ignore[arg-type]
        titre=titre,
        detail=detail,
        at=_utc(moment) or datetime.now(UTC),
    )


def stat_out(value: int, delta: str = "") -> StatOut:
    return StatOut(value=value, delta=delta)


DEFAULT_COLLECTOR_SETTINGS = CollectorSettingsOut(
    requests_per_second=1.0, depth=2, max_pages=100, timeout=10
)
DEFAULT_NETWORK_SETTINGS = NetworkSettingsOut(proxy="", user_agent_rotation=False, robots_txt=True)
DEFAULT_RETENTION_SETTINGS = RetentionSettingsOut(
    preuves="90", auto_suppression_logs=AutoSuppressionSettingsOut(active=True, jours=30)
)
DEFAULT_SECURITY_SETTINGS = SecuritySettingsOut(reset_warning=True)


def settings_from_payload(payload: dict[str, Any] | None) -> dict[str, Any]:
    """Merge stored settings over the defaults without trusting the payload shape."""
    merged: dict[str, Any] = {}
    if isinstance(payload, dict):
        merged.update(payload)
    return merged
