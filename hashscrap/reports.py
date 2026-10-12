"""Versioned, deterministic report rendering from evidence-backed input data."""

from __future__ import annotations

import json
from datetime import UTC, datetime
from typing import Final, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

REPORT_SCHEMA_VERSION: Final[Literal["1.0"]] = "1.0"


class ReportModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ReportSource(ReportModel):
    source_id: str
    source_name: str
    source_url: str | None = None
    status: Literal["succeeded", "failed", "partial", "unavailable"]
    fetched_count: int = Field(default=0, ge=0)
    failed_count: int = Field(default=0, ge=0)
    error_code: str | None = None


class ReportObservation(ReportModel):
    observation_id: str
    field_name: str
    value: str
    source_id: str
    source_url: str
    observed_at: datetime
    evidence_ref: str = Field(min_length=1, max_length=500)
    classification: Literal["direct_observation", "exact_match", "hypothesis", "unverified"]
    validation_status: Literal["unreviewed", "validated", "rejected"] = "unreviewed"

    @field_validator("observed_at")
    @classmethod
    def require_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("observed_at must be timezone-aware")
        return value.astimezone(UTC)


class ReportRelationship(ReportModel):
    relationship_id: str
    source_entity: str
    relation_type: str
    target_entity: str
    evidence_observation_id: str = Field(min_length=1)
    evidence_ref: str = Field(min_length=1, max_length=500)
    review_status: Literal["unreviewed", "accepted_exact", "needs_review", "rejected"]


class ReportError(ReportModel):
    source_id: str
    error_code: str
    message: str


class InvestigationReport(ReportModel):
    schema_version: Literal["1.0"] = REPORT_SCHEMA_VERSION
    investigation_id: str
    title: str
    scope: str
    started_at: datetime
    finished_at: datetime | None = None
    sources: list[ReportSource] = Field(default_factory=list)
    observations: list[ReportObservation] = Field(default_factory=list)
    relationships: list[ReportRelationship] = Field(default_factory=list)
    errors: list[ReportError] = Field(default_factory=list)
    limitations: list[str] = Field(default_factory=list)

    @field_validator("started_at", "finished_at")
    @classmethod
    def require_timezone(cls, value: datetime | None) -> datetime | None:
        if value is not None:
            if value.tzinfo is None or value.utcoffset() is None:
                raise ValueError("report timestamps must be timezone-aware")
            return value.astimezone(UTC)
        return value


def _time(value: datetime | None) -> str:
    return value.isoformat() if value is not None else "Non renseignée"


def _sort_report(report: InvestigationReport) -> InvestigationReport:
    return report.model_copy(
        update={
            "sources": sorted(report.sources, key=lambda item: (item.source_id, item.source_name)),
            "observations": sorted(
                report.observations,
                key=lambda item: (
                    item.source_id,
                    item.observed_at.isoformat(),
                    item.field_name,
                    item.evidence_ref,
                    item.observation_id,
                ),
            ),
            "relationships": sorted(
                report.relationships,
                key=lambda item: (
                    item.source_entity,
                    item.relation_type,
                    item.target_entity,
                    item.evidence_observation_id,
                    item.relationship_id,
                ),
            ),
            "errors": sorted(
                report.errors, key=lambda item: (item.source_id, item.error_code, item.message)
            ),
            "limitations": sorted(set(report.limitations)),
        }
    )


def render_report_json(report: InvestigationReport) -> str:
    """Render stable UTF-8 JSON with sorted keys and no invented missing values."""
    ordered = _sort_report(report)
    return (
        json.dumps(
            ordered.model_dump(mode="json"),
            ensure_ascii=False,
            sort_keys=True,
            indent=2,
        )
        + "\n"
    )


def _md_cell(value: str) -> str:
    return value.replace("\\", "\\\\").replace("|", "\\|").replace("\r", " ").replace("\n", " ")


def render_report_markdown(report: InvestigationReport) -> str:
    """Render a sourced report that separates direct observations from hypotheses."""
    ordered = _sort_report(report)
    lines = [
        f"# {_md_cell(ordered.title)}",
        "",
        f"- **ID de l'enquête :** {_md_cell(ordered.investigation_id)}",
        f"- **Schéma du rapport :** {ordered.schema_version}",
        f"- **Périmètre :** {_md_cell(ordered.scope)}",
        f"- **Début :** {_time(ordered.started_at)}",
        f"- **Fin :** {_time(ordered.finished_at)}",
        "",
        "## Couverture des sources",
        "",
        "| Source | État | URL | Pages réussies | Échecs | Code d'erreur |",
        "|---|---|---|---:|---:|---|",
    ]
    if ordered.sources:
        for source in ordered.sources:
            lines.append(
                f"| {_md_cell(source.source_name)} | {source.status} | "
                f"{_md_cell(source.source_url or 'Non renseignée')} | {source.fetched_count} | "
                f"{source.failed_count} | {_md_cell(source.error_code or '—')} |"
            )
    else:
        lines.append("| Aucune source enregistrée | unavailable | — | 0 | 0 | — |")

    lines.extend(["", "## Observations", ""])
    if not ordered.observations:
        lines.append("Aucune observation disponible.")
    else:
        for observation in ordered.observations:
            lines.extend(
                [
                    f"### {_md_cell(observation.field_name)}",
                    "",
                    f"- **Classification :** {observation.classification}",
                    f"- **Valeur :** {_md_cell(observation.value)}",
                    f"- **Source :** {_md_cell(observation.source_id)} — "
                    f"{_md_cell(observation.source_url)}",
                    f"- **Date :** {_time(observation.observed_at)}",
                    f"- **Preuve :** {_md_cell(observation.evidence_ref)}",
                    f"- **Validation :** {observation.validation_status}",
                    f"- **Observation ID :** {_md_cell(observation.observation_id)}",
                    "",
                ]
            )

    lines.extend(["## Relations", ""])
    if not ordered.relationships:
        lines.append("Aucune relation sourcée disponible.")
    else:
        for relation in ordered.relationships:
            lines.append(
                f"- **{_md_cell(relation.source_entity)}** — "
                f"{_md_cell(relation.relation_type)} → **{_md_cell(relation.target_entity)}** "
                f"(revue : {relation.review_status}) ; preuve : "
                f"{_md_cell(relation.evidence_observation_id)} / {_md_cell(relation.evidence_ref)}."
            )

    lines.extend(["", "## Erreurs de collecte", ""])
    if not ordered.errors:
        lines.append("Aucune erreur de collecte déclarée.")
    else:
        for error in ordered.errors:
            lines.append(
                f"- Source {_md_cell(error.source_id)} — {_md_cell(error.error_code)} : "
                f"{_md_cell(error.message)}"
            )

    lines.extend(["", "## Limites et couverture", ""])
    if ordered.limitations:
        lines.extend(f"- {_md_cell(item)}" for item in ordered.limitations)
    else:
        lines.append("- Les limites supplémentaires ne sont pas renseignées.")
    lines.extend(
        [
            "- Ce rapport reflète uniquement les sources et observations listées ; "
            "il ne prouve pas une couverture exhaustive.",
            "- Les hypothèses et correspondances à revoir ne doivent pas être "
            "interprétées comme des faits confirmés.",
            "",
        ]
    )
    return "\n".join(lines)
