"""Bounded PostgreSQL readiness gate for the application container."""

from __future__ import annotations

import os
import subprocess
import sys
import time

import psycopg


def _libpq_url(database_url: str) -> str:
    """Convert a SQLAlchemy URL (postgresql+psycopg://...) into a libpq URI."""
    scheme, sep, rest = database_url.partition("://")
    if not sep:
        return database_url
    return f"{scheme.split('+', 1)[0]}://{rest}"


def main() -> int:
    database_url = os.environ.get("HASHSCRAP_DATABASE_URL", "")
    if not database_url:
        print("HASHSCRAP_DATABASE_URL is required", file=sys.stderr)
        return 2

    deadline = time.monotonic() + 90
    while True:
        try:
            with psycopg.connect(_libpq_url(database_url), connect_timeout=3):
                break
        except psycopg.OperationalError:
            if time.monotonic() >= deadline:
                print("PostgreSQL did not become ready within 90 seconds", file=sys.stderr)
                return 1
            time.sleep(2)

    if len(sys.argv) < 2:
        print("No application command supplied", file=sys.stderr)
        return 2
    return subprocess.call(sys.argv[1:])


if __name__ == "__main__":
    raise SystemExit(main())
