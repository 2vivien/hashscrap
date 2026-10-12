from __future__ import annotations

import pytest

from hashscrap.benchmark import run_benchmark


def test_small_benchmark_reports_quality_duplicates_and_environment() -> None:
    report = run_benchmark(count=12, duplicate_every=3)
    metrics = report["metrics"]
    assert report["configuration"]["network"] == "disabled"
    assert metrics["urls_attempted"] == 12
    assert metrics["valid_html_pages"] > 0
    assert metrics["title_fields_correct"] == metrics["title_fields_expected"]
    assert metrics["content_duplicates"] == 8
    assert metrics["jsonl_export_bytes"] > 0
    assert report["environment"]["python"]


def test_benchmark_rejects_unbounded_count() -> None:
    with pytest.raises(ValueError, match="between 1 and 100000"):
        run_benchmark(count=100_001)


def test_benchmark_rejects_invalid_duplicate_interval() -> None:
    with pytest.raises(ValueError, match="duplicate_every"):
        run_benchmark(count=10, duplicate_every=0)
