"""Response contracts for the versioned engine API.

The field names are the contract shared with the web interface: every payload
is validated by the client with a Zod schema mirroring these models.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

CollecteType = Literal["web", "api", "reseau"]
CollecteStatus = Literal["en_cours", "terminee", "echouee", "annulee", "en_attente"]
SourceStatus = Literal["validee", "en_attente", "erreur"]
InvestigationStatus = Literal["en_cours", "terminee", "en_attente", "annulee"]
EntityType = Literal["email", "domaine", "ip", "personne", "telephone", "hash"]
Confidence = Literal["elevee", "moyenne", "faible"]
EvidenceStatus = Literal["validee", "en_attente", "erreur"]
ReportStatus = Literal["validee", "en_attente"]
ReportFormat = Literal["pdf", "markdown", "json"]
TimelineType = Literal["collecte", "observation", "evenement", "preuve", "relation"]


class ApiModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


# --- Input schemas (write operations) ---


class SourceCreateIn(ApiModel):
    nom: str = Field(min_length=1, max_length=120)
    url: str = Field(min_length=1, max_length=4096)
    type: CollecteType = "web"
    domaines: list[str] = Field(default_factory=list, min_length=1)


class CollecteLaunchIn(ApiModel):
    source: str = Field(min_length=1)
    url: str = Field(min_length=1, max_length=4096)


class InvestigationCreateIn(ApiModel):
    nom: str = Field(min_length=1, max_length=160)
    description: str = ""


class RapportGenerateIn(ApiModel):
    titre: str = Field(min_length=1, max_length=200)
    investigation: str = ""


class ParametresUpdateIn(ApiModel):
    collecteur: CollectorSettingsOut | None = None
    reseau: NetworkSettingsOut | None = None
    conservation: RetentionSettingsOut | None = None
    securite: SecuritySettingsOut | None = None


class CollecteOut(ApiModel):
    id: str
    source: str
    type: CollecteType
    status: CollecteStatus
    progress: int = Field(ge=0, le=100)
    pages: int = Field(ge=0)
    duration: str
    started_at: datetime


class CollecteErrorOut(ApiModel):
    code: str
    message: str
    type: str
    count: int = Field(ge=0)


class CollecteEventOut(ApiModel):
    at: datetime
    label: str
    detail: str = ""


class CollecteObservationsOut(ApiModel):
    total: int = Field(ge=0)
    validated: int = Field(ge=0)
    rejected: int = Field(ge=0)


class CollecteDetailOut(CollecteOut):
    observations: CollecteObservationsOut
    erreurs: list[CollecteErrorOut]
    evenements: list[CollecteEventOut]


class CollectesResponse(ApiModel):
    items: list[CollecteOut]
    total: int = Field(ge=0)


class SourceOut(ApiModel):
    id: str
    nom: str
    url: str
    type: CollecteType
    statut: SourceStatus
    derniere_collecte: datetime | None = None
    domaines: list[str] = Field(default_factory=list)


class SourcesResponse(ApiModel):
    items: list[SourceOut]
    total: int = Field(ge=0)


class InvestigationOut(ApiModel):
    id: str
    nom: str
    description: str
    statut: InvestigationStatus
    sources: int = Field(ge=0)
    observations: int = Field(ge=0)
    derniere_activite: datetime


class InvestigationsResponse(ApiModel):
    items: list[InvestigationOut]
    total: int = Field(ge=0)


class EntityOut(ApiModel):
    id: str
    valeur: str
    type: EntityType
    observations: int = Field(ge=0)
    confiance: Confidence
    derniere_detection: datetime


class EntitiesResponse(ApiModel):
    items: list[EntityOut]
    total: int = Field(ge=0)


class EntityObservationOut(ApiModel):
    id: str
    champ: str
    valeur_brute: str
    valeur_normalisee: str
    extracteur: str
    version_extracteur: str
    evidence_ref: str
    validation_status: Literal["unreviewed", "validated", "rejected"]


class EntityRelationOut(ApiModel):
    id: str
    cible: str
    type: str
    libelle: str


class EntityDetailOut(EntityOut):
    observations_liste: list[EntityObservationOut]
    relations: list[EntityRelationOut]
    sources: list[str]


class TimelineEventOut(ApiModel):
    id: str
    at: datetime
    date: str
    heure: str
    type: TimelineType
    titre: str
    description: str
    source: str = ""


class ChronologieResponse(ApiModel):
    items: list[TimelineEventOut]
    total: int = Field(ge=0)


class EvidenceOut(ApiModel):
    id: str
    url: str
    source: str
    collectee_le: datetime
    sha256: str
    statut: EvidenceStatus
    taille: int = Field(ge=0)
    apercu_url: str = ""


class PreuvesResponse(ApiModel):
    items: list[EvidenceOut]
    total: int = Field(ge=0)


class ReportOut(ApiModel):
    id: str
    titre: str
    investigation: str
    statut: ReportStatus
    genere_le: datetime
    format: ReportFormat
    contenu: str


class RapportsResponse(ApiModel):
    items: list[ReportOut]
    total: int = Field(ge=0)


class StatOut(ApiModel):
    value: int = Field(ge=0)
    delta: str = ""


class DashboardStatsOut(ApiModel):
    sources: StatOut
    collectes: StatOut
    observations: StatOut
    entites: StatOut


class ActivityOut(ApiModel):
    id: str
    type: Literal["collecte", "observation", "source", "rapport", "erreur"]
    titre: str
    detail: str
    at: datetime


class DashboardOut(ApiModel):
    stats: DashboardStatsOut
    collectes: list[CollecteOut]
    activite: list[ActivityOut]
    points_attention: list[str]


class CollectorSettingsOut(ApiModel):
    requests_per_second: float
    depth: int
    max_pages: int
    timeout: int


class NetworkSettingsOut(ApiModel):
    proxy: str
    user_agent_rotation: bool
    robots_txt: bool


class RetentionSettingsOut(ApiModel):
    preuves: Literal["90", "365", "illimite"]
    auto_suppression_logs: AutoSuppressionSettingsOut


class AutoSuppressionSettingsOut(ApiModel):
    active: bool
    jours: int = Field(ge=0, le=365)


class SecuritySettingsOut(ApiModel):
    reset_warning: bool


class AuditLogLineOut(ApiModel):
    at: str
    level: Literal["INFO", "DEBUG", "WARN", "ERROR"]
    message: str


class AuditSettingsOut(ApiModel):
    logs: list[AuditLogLineOut]
    derniere_maj: str
    version: str
    licence: str


class ParametresOut(ApiModel):
    collecteur: CollectorSettingsOut
    reseau: NetworkSettingsOut
    conservation: RetentionSettingsOut
    securite: SecuritySettingsOut
    audit: AuditSettingsOut


class HealthOut(ApiModel):
    status: str
    version: str
    database: str
    details: dict[str, Any] = Field(default_factory=dict)
