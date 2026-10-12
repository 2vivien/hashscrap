"""Stable content fingerprints and non-destructive duplicate detection."""

from __future__ import annotations

import hashlib
from dataclasses import dataclass
from urllib.parse import urlsplit, urlunsplit
from uuid import UUID

from hashscrap.extraction import DocumentRecord


def fingerprint_content(body: bytes) -> str:
    """Return a stable SHA-256 hex digest for the exact response body bytes."""
    return hashlib.sha256(body).hexdigest()


def _url_identity(url: str) -> str:
    """Normalize only URL components that do not identify different resources."""
    parts = urlsplit(url)
    scheme = parts.scheme.lower()
    hostname = (parts.hostname or "").lower()
    if not scheme or not hostname:
        return url
    try:
        port = parts.port
    except ValueError:
        return url
    if (scheme, port) in {("http", 80), ("https", 443)}:
        port = None
    host = f"[{hostname}]" if ":" in hostname and not hostname.startswith("[") else hostname
    netloc = f"{host}:{port}" if port is not None else host
    # Query strings are retained: they may identify materially different content.
    return urlunsplit((scheme, netloc, parts.path or "/", parts.query, ""))


@dataclass(frozen=True, slots=True)
class DuplicateMatch:
    """Duplicate signals for one document; the document is never discarded."""

    document_id: UUID
    content_sha256: str
    url_duplicate_of: UUID | None = None
    content_duplicate_of: UUID | None = None


class DeduplicationIndex:
    """Track first-seen URL/content identities while retaining every observation."""

    def __init__(self) -> None:
        self._first_by_url: dict[str, UUID] = {}
        self._first_by_content: dict[str, UUID] = {}

    def register(self, document: DocumentRecord, body: bytes) -> DuplicateMatch:
        """Record a document and report prior matches without deleting history."""
        digest = fingerprint_content(body)
        identity_url = _url_identity(document.canonical_url or document.original_url)
        url_duplicate_of = self._first_by_url.get(identity_url)
        content_duplicate_of = self._first_by_content.get(digest)
        self._first_by_url.setdefault(identity_url, document.id)
        self._first_by_content.setdefault(digest, document.id)
        return DuplicateMatch(
            document_id=document.id,
            content_sha256=digest,
            url_duplicate_of=url_duplicate_of,
            content_duplicate_of=content_duplicate_of,
        )
