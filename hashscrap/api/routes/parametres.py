"""Engine settings endpoints."""

from __future__ import annotations

from fastapi import APIRouter
from sqlalchemy import select

from hashscrap.api.deps import session_scope
from hashscrap.api.schemas import (
    AuditLogLineOut,
    AuditSettingsOut,
    CollectorSettingsOut,
    NetworkSettingsOut,
    ParametresOut,
    RetentionSettingsOut,
    SecuritySettingsOut,
)
from hashscrap.api.serializers import (
    DEFAULT_COLLECTOR_SETTINGS,
    DEFAULT_NETWORK_SETTINGS,
    DEFAULT_RETENTION_SETTINGS,
    DEFAULT_SECURITY_SETTINGS,
    settings_from_payload,
)
from hashscrap.models import AuditEvent, EngineSetting

router = APIRouter(prefix="/parametres", tags=["parametres"])

VERSION = "v1.0.0 bounded"
LICENCE = "Active"


def _stored(session: object, key: str) -> dict[str, object]:
    setting = session.get(EngineSetting, key)  # type: ignore[attr-defined]
    if setting is None:
        return {}
    return settings_from_payload(setting.value)


@router.get("", response_model=ParametresOut)
def get_parametres() -> ParametresOut:
    with session_scope() as session:
        collecteur = settings_from_payload(_stored(session, "collecteur"))
        reseau = settings_from_payload(_stored(session, "reseau"))
        conservation = settings_from_payload(_stored(session, "conservation"))
        securite = settings_from_payload(_stored(session, "securite"))

        logs = session.scalars(
            select(AuditEvent).order_by(AuditEvent.occurred_at.desc()).limit(20)
        ).all()
        audit_lines = [
            AuditLogLineOut(
                at=event.occurred_at.strftime("%H:%M"),
                level=event.action.upper(),
                message=event.resource,
            )
            for event in reversed(logs)
        ]
        latest = logs[0].occurred_at if logs else None

        return ParametresOut(
            collecteur=CollectorSettingsOut(
                requests_per_second=float(
                    collecteur.get(
                        "requests_per_second", DEFAULT_COLLECTOR_SETTINGS.requests_per_second
                    )
                ),
                depth=int(collecteur.get("depth", DEFAULT_COLLECTOR_SETTINGS.depth)),
                max_pages=int(collecteur.get("max_pages", DEFAULT_COLLECTOR_SETTINGS.max_pages)),
                timeout=int(collecteur.get("timeout", DEFAULT_COLLECTOR_SETTINGS.timeout)),
            ),
            reseau=NetworkSettingsOut(
                proxy=str(reseau.get("proxy", DEFAULT_NETWORK_SETTINGS.proxy)),
                user_agent_rotation=bool(
                    reseau.get("user_agent_rotation", DEFAULT_NETWORK_SETTINGS.user_agent_rotation)
                ),
                robots_txt=str(reseau.get("robots_txt", DEFAULT_NETWORK_SETTINGS.robots_txt)),
            ),
            conservation=RetentionSettingsOut(
                preuves=str(conservation.get("preuves", DEFAULT_RETENTION_SETTINGS.preuves)),
                auto_suppression_logs=str(
                    conservation.get(
                        "auto_suppression_logs", DEFAULT_RETENTION_SETTINGS.auto_suppression_logs
                    )
                ),
            ),
            securite=SecuritySettingsOut(
                reset_warning=str(
                    securite.get("reset_warning", DEFAULT_SECURITY_SETTINGS.reset_warning)
                )
            ),
            audit=AuditSettingsOut(
                logs=audit_lines,
                derniere_maj=latest.strftime("%d/%m %H:%M") if latest else "—",
                version=VERSION,
                licence=LICENCE,
            ),
        )
