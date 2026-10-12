"""Deterministic, explainable entity matching for supported identifier types."""
from __future__ import annotations

import ipaddress
from dataclasses import dataclass
from typing import Literal
from urllib.parse import urlsplit, urlunsplit

EntityType = Literal["organization", "domain", "ip", "url"]
ReviewStatus = Literal["accepted_exact", "needs_review", "unmatched"]


@dataclass(frozen=True, slots=True)
class NormalizedIdentifier:
    entity_type: EntityType
    raw_value: str
    normalized_value: str
    method: str


@dataclass(frozen=True, slots=True)
class MatchDecision:
    entity_type: EntityType
    normalized_value: str
    matched_entity_ids: tuple[str, ...]
    review_status: ReviewStatus
    method: str
    reason: str


def normalize_identifier(entity_type: EntityType, value: str) -> NormalizedIdentifier:
    """Normalize one identifier using explicit type-specific rules."""
    raw = value
    candidate = value.strip()
    if not candidate:
        raise ValueError("identifier must not be empty")

    if entity_type == "organization":
        normalized = " ".join(candidate.split()).casefold()
        return NormalizedIdentifier(entity_type, raw, normalized, "organization_name_casefold")

    if entity_type == "domain":
        candidate = candidate.rstrip(".").lower()
        if candidate.startswith("*."):
            candidate = candidate[2:]
        if "/" in candidate or ":" in candidate or "@" in candidate:
            raise ValueError("domain identifier must contain only a hostname")
        try:
            normalized = candidate.encode("idna").decode("ascii")
        except UnicodeError as exc:
            raise ValueError("domain identifier is invalid") from exc
        if not normalized or any(not label or len(label) > 63 for label in normalized.split(".")):
            raise ValueError("domain identifier is invalid")
        return NormalizedIdentifier(entity_type, raw, normalized, "domain_idna_lowercase")

    if entity_type == "ip":
        try:
            address = ipaddress.ip_address(candidate)
        except ValueError as exc:
            raise ValueError("IP identifier is invalid") from exc
        if not address.is_global:
            raise ValueError("only globally routable IP addresses are supported")
        return NormalizedIdentifier(entity_type, raw, address.compressed, "ipaddress_compressed")

    parts = urlsplit(candidate)
    scheme = parts.scheme.lower()
    hostname = (parts.hostname or "").lower()
    if scheme not in {"http", "https"} or not hostname or parts.username or parts.password:
        raise ValueError("URL identifier must be an absolute HTTP(S) URL without credentials")
    try:
        port = parts.port
    except ValueError as exc:
        raise ValueError("URL port is invalid") from exc
    if (scheme, port) in {("http", 80), ("https", 443)}:
        port = None
    host = f"[{hostname}]" if ":" in hostname and not hostname.startswith("[") else hostname
    netloc = f"{host}:{port}" if port is not None else host
    normalized = urlunsplit((scheme, netloc, parts.path or "/", parts.query, ""))
    return NormalizedIdentifier(entity_type, raw, normalized, "url_normalized_v1")


def decide_match(
    identifier: NormalizedIdentifier,
    matching_entity_ids: list[str],
) -> MatchDecision:
    """Decide whether a normalized identifier is an exact match or needs review.

    Organization names are never auto-merged: same-name organizations can be homonyms.
    """
    matches = tuple(sorted(set(matching_entity_ids)))
    if not matches:
        status: ReviewStatus = "unmatched"
        reason = "no_exact_identifier_match"
    elif identifier.entity_type == "organization":
        status = "needs_review"
        reason = "organization_name_may_be_ambiguous"
    elif len(matches) > 1:
        status = "needs_review"
        reason = "multiple_exact_matches_require_review"
    else:
        status = "accepted_exact"
        reason = "single_exact_normalized_identifier_match"
    return MatchDecision(
        entity_type=identifier.entity_type,
        normalized_value=identifier.normalized_value,
        matched_entity_ids=matches,
        review_status=status,
        method=identifier.method,
        reason=reason,
    )
