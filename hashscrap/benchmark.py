"""Offline, deterministic benchmark for extraction, fingerprints and export volume."""
from __future__ import annotations

import argparse
import json
import platform
import sys
import time
import tracemalloc
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from hashscrap.extraction import extract_html
from hashscrap.exports import export_jsonl
from hashscrap.fingerprints import DeduplicationIndex, fingerprint_content


def run_benchmark(count: int = 10_000, duplicate_every: int = 100) -> dict[str, Any]:
    """Benchmark a synthetic in-memory corpus without making public network requests."""
    if not 1 <= count <= 100_000:
        raise ValueError("count must be between 1 and 100000")
    if duplicate_every < 1:
        raise ValueError("duplicate_every must be positive")

    index = DeduplicationIndex()
    results = []
    expected_titles: dict[str, str] = {}
    attempted = 0
    valid_pages = 0
    title_correct = 0
    content_duplicates = 0
    body_bytes = 0
    started_at = datetime.now(UTC)
    cpu_started = time.process_time()
    tracemalloc.start()
    wall_started = time.perf_counter()

    for number in range(count):
        attempted += 1
        # Repeated body bytes model repeated content at distinct URLs.
        content_number = number - (number % duplicate_every)
        expected_title = f"Synthetic page {content_number}"
        body = (
            "<!doctype html><html><head><title>"
            + expected_title
            + "</title><meta name=\"description\" content=\"Offline fixture\"></head>"
            + f"<body><p>Record {content_number}</p><a href=\"/page/{number + 1}\">Next</a></body></html>"
        ).encode("utf-8")
        body_bytes += len(body)
        url = f"https://benchmark.invalid/page/{number}"
        content_type = "text/html; charset=utf-8"
        if number % 97 == 0:
            content_type = "application/octet-stream"

        result = extract_html(
            url=url,
            status_code=200,
            content_type=content_type,
            body=body,
            fetched_at=started_at,
        )
        results.append(result)
        match = index.register(result.document, body)
        if match.content_duplicate_of is not None:
            content_duplicates += 1
        if content_type.startswith("text/html"):
            valid_pages += 1
            expected_titles[str(result.document.id)] = expected_title
            extracted = next(
                (item.normalized_value for item in result.observations if item.field_name == "title"),
                None,
            )
            if extracted == expected_title:
                title_correct += 1

    wall_seconds = time.perf_counter() - wall_started
    cpu_seconds = time.process_time() - cpu_started
    _, peak_memory_bytes = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    export_text = export_jsonl(results)
    export_bytes = len(export_text.encode("utf-8"))
    return {
        "schema_version": "1.0",
        "benchmark": "offline-extraction-dedup-export",
        "started_at": started_at.isoformat(),
        "environment": {
            "python": sys.version.split()[0],
            "platform": platform.platform(),
            "processor": platform.processor() or "unknown",
        },
        "configuration": {"count": count, "duplicate_every": duplicate_every, "network": "disabled"},
        "metrics": {
            "urls_attempted": attempted,
            "valid_html_pages": valid_pages,
            "title_fields_expected": valid_pages,
            "title_fields_correct": title_correct,
            "title_accuracy": title_correct / valid_pages if valid_pages else 0.0,
            "content_duplicates": content_duplicates,
            "content_duplicate_rate": content_duplicates / count if count else 0.0,
            "body_bytes_processed": body_bytes,
            "jsonl_export_bytes": export_bytes,
            "wall_seconds": round(wall_seconds, 6),
            "cpu_seconds": round(cpu_seconds, 6),
            "peak_traced_memory_bytes": peak_memory_bytes,
            "pages_per_second": round(count / wall_seconds, 3) if wall_seconds else 0.0,
        },
        "limitations": [
            "This is a component benchmark, not an end-to-end Scrapy or PostgreSQL benchmark.",
            "Peak memory uses tracemalloc and does not represent total process RSS.",
            "Timing varies by machine and must not be compared without environment metadata.",
        ],
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Offline HashScrap extraction benchmark")
    parser.add_argument("--count", type=int, default=10_000, help="synthetic pages (1..100000)")
    parser.add_argument("--duplicate-every", type=int, default=100)
    parser.add_argument("--output", type=Path, help="optional JSON report path")
    args = parser.parse_args(argv)
    report = run_benchmark(args.count, args.duplicate_every)
    output = json.dumps(report, ensure_ascii=False, sort_keys=True, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(output, encoding="utf-8")
    print(output, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
