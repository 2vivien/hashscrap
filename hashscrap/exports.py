"""Deterministic exports that retain document and observation provenance."""
from __future__ import annotations

import csv
import io
import json
from collections.abc import Iterable, Mapping
from typing import Any
from uuid import UUID

from hashscrap.extraction import ExtractionResult, Observation

CSV_FIELDS = (
    "document_id",
    "source_id",
    "original_url",
    "canonical_url",
    "status_code",
    "content_type",
    "fetched_at",
    "parser_name",
    "parser_version",
    "content_sha256",
    "observation_id",
    "field_name",
    "raw_value",
    "normalized_value",
    "observed_at",
    "extractor",
    "extractor_version",
    "evidence_ref",
    "validation_status",
)


def _iso(value: Any) -> str:
    return value.isoformat() if hasattr(value, "isoformat") else str(value)


def _document_record(
    result: ExtractionResult,
    source_ids: Mapping[UUID, str],
    fingerprints: Mapping[UUID, str],
) -> dict[str, Any]:
    document = result.document
    observations = sorted(
        result.observations,
        key=lambda item: (item.field_name, item.evidence_ref, str(item.id)),
    )
    return {
        "document": {
            "id": str(document.id),
            "source_id": source_ids.get(document.id),
            "original_url": document.original_url,
            "canonical_url": document.canonical_url,
            "status_code": document.status_code,
            "content_type": document.content_type,
            "fetched_at": _iso(document.fetched_at),
            "parser_name": document.parser_name,
            "parser_version": document.parser_version,
            "content_sha256": fingerprints.get(document.id),
        },
        "observations": [
            {
                "id": str(observation.id),
                "document_id": str(observation.document_id),
                "field_name": observation.field_name,
                "raw_value": observation.raw_value,
                "normalized_value": observation.normalized_value,
                "observed_at": _iso(observation.observed_at),
                "extractor": observation.extractor,
                "extractor_version": observation.extractor_version,
                "evidence_ref": observation.evidence_ref,
                "validation_status": observation.validation_status,
            }
            for observation in observations
        ],
    }


def export_jsonl(
    results: Iterable[ExtractionResult],
    *,
    source_ids: Mapping[UUID, str] | None = None,
    fingerprints: Mapping[UUID, str] | None = None,
) -> str:
    """Serialize one document per line, including documents with no observations.

    The same model instances and metadata mappings produce byte-for-byte stable output.
    """
    sources = source_ids or {}
    hashes = fingerprints or {}
    ordered = sorted(results, key=lambda item: (item.document.original_url, str(item.document.id)))
    lines = [
        json.dumps(
            _document_record(result, sources, hashes),
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
        )
        for result in ordered
    ]
    return "\n".join(lines) + ("\n" if lines else "")


def _spreadsheet_safe(value: Any) -> str:
    """Neutralize formula-leading text before writing values consumed by spreadsheets."""
    if value is None:
        return ""
    text = _iso(value)
    probe = text.lstrip(" \t\r\n")
    if probe.startswith(("=", "+", "-", "@")):
        return "'" + text
    if text.startswith(("\t", "\r", "\n")):
        return "'" + text
    return text


def _row(result: ExtractionResult, observation: Observation | None, source_ids: Mapping[UUID, str], fingerprints: Mapping[UUID, str]) -> dict[str, str]:
    document = result.document
    values: dict[str, Any] = {
        "document_id": document.id,
        "source_id": source_ids.get(document.id),
        "original_url": document.original_url,
        "canonical_url": document.canonical_url,
        "status_code": document.status_code,
        "content_type": document.content_type,
        "fetched_at": document.fetched_at,
        "parser_name": document.parser_name,
        "parser_version": document.parser_version,
        "content_sha256": fingerprints.get(document.id),
        "observation_id": observation.id if observation else None,
        "field_name": observation.field_name if observation else None,
        "raw_value": observation.raw_value if observation else None,
        "normalized_value": observation.normalized_value if observation else None,
        "observed_at": observation.observed_at if observation else None,
        "extractor": observation.extractor if observation else None,
        "extractor_version": observation.extractor_version if observation else None,
        "evidence_ref": observation.evidence_ref if observation else None,
        "validation_status": observation.validation_status if observation else None,
    }
    return {field: _spreadsheet_safe(values.get(field)) for field in CSV_FIELDS}


def export_csv(
    results: Iterable[ExtractionResult],
    *,
    source_ids: Mapping[UUID, str] | None = None,
    fingerprints: Mapping[UUID, str] | None = None,
) -> str:
    """Export one row per observation; retain a row for documents without observations."""
    sources = source_ids or {}
    hashes = fingerprints or {}
    output = io.StringIO(newline="")
    writer = csv.DictWriter(output, fieldnames=CSV_FIELDS, extrasaction="raise", lineterminator="\n")
    writer.writeheader()
    ordered = sorted(results, key=lambda item: (item.document.original_url, str(item.document.id)))
    for result in ordered:
        observations = sorted(
            result.observations,
            key=lambda item: (item.field_name, item.evidence_ref, str(item.id)),
        )
        if observations:
            for observation in observations:
                writer.writerow(_row(result, observation, sources, hashes))
        else:
            writer.writerow(_row(result, None, sources, hashes))
    return output.getvalue()
