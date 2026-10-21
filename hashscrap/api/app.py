"""FastAPI application exposing the engine over HTTP.

The API is read-mostly: it serves the persisted collection history to the web
interface. Write endpoints that would trigger a collection are intentionally
absent until the engine exposes a safe, audited way to schedule them.
"""

from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from hashscrap import __version__
from hashscrap.api.deps import session_scope
from hashscrap.api.routes import (
    chronologie,
    collectes,
    dashboard,
    entites,
    investigations,
    parametres,
    preuves,
    rapports,
    sources,
)
from hashscrap.api.schemas import HealthOut

API_PREFIX = "/api/v1"
DEFAULT_ORIGINS = ("http://localhost:5173", "http://127.0.0.1:5173")


def _origins() -> list[str]:
    configured = os.environ.get("HASHSCRAP_API_ORIGINS", "").strip()
    if not configured:
        return list(DEFAULT_ORIGINS)
    return [origin.strip() for origin in configured.split(",") if origin.strip()]


def create_app() -> FastAPI:
    """Build the API application."""
    app = FastAPI(
        title="HashScrap API",
        version=__version__,
        description="Read API over the persisted HashScrap collection history.",
        docs_url=f"{API_PREFIX}/docs",
        openapi_url=f"{API_PREFIX}/openapi.json",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=_origins(),
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
        allow_headers=["Accept", "Content-Type"],
    )

    @app.get(f"{API_PREFIX}/health", response_model=HealthOut, tags=["health"])
    def health() -> HealthOut:
        database = "unavailable"
        details: dict[str, object] = {}
        try:
            with session_scope() as session:
                session.execute(text("SELECT 1"))
                database = "connected"
        except Exception as exc:  # noqa: BLE001 - health must never raise
            details["error"] = type(exc).__name__
        return HealthOut(
            status="ok" if database == "connected" else "degraded",
            version=__version__,
            database=database,
            details=details,
        )

    for module in (
        dashboard,
        sources,
        collectes,
        investigations,
        entites,
        chronologie,
        preuves,
        rapports,
        parametres,
    ):
        app.include_router(module.router, prefix=API_PREFIX)

    return app


app = create_app()
