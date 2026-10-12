"""Database configuration; credentials are supplied only through environment variables."""

from __future__ import annotations

import os

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine, make_url


def database_url() -> str:
    """Read and validate the database URL without exposing it in logs."""
    value = os.environ.get("HASHSCRAP_DATABASE_URL", "").strip()
    if not value:
        raise RuntimeError("HASHSCRAP_DATABASE_URL is required")
    url = make_url(value)
    if url.get_backend_name() != "postgresql":
        raise RuntimeError("HASHSCRAP_DATABASE_URL must target PostgreSQL")
    return value


def create_database_engine() -> Engine:
    """Create a SQLAlchemy engine from external configuration."""
    return create_engine(database_url(), pool_pre_ping=True)
