"""Shared dependencies for the API routers."""

from __future__ import annotations

from collections.abc import Iterator
from contextlib import contextmanager

from sqlalchemy.orm import Session

from hashscrap.db import create_database_engine


@contextmanager
def session_scope() -> Iterator[Session]:
    """Yield a session bound to a freshly created engine.

    The engine is created per request so the pool never outlives the process
    that owns it, which keeps the API safe to run in a short-lived container.
    """
    engine = create_database_engine()
    try:
        with Session(engine) as session:
            yield session
    finally:
        engine.dispose()
