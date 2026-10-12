from __future__ import annotations

import pytest

from hashscrap.correlation import decide_match, normalize_identifier


def test_domain_normalization_handles_case_trailing_dot_and_idna() -> None:
    first = normalize_identifier("domain", " EXAMPLE.COM. ")
    second = normalize_identifier("domain", "example.com")
    assert first.normalized_value == second.normalized_value == "example.com"


def test_domain_wildcard_normalizes_to_base_domain() -> None:
    assert normalize_identifier("domain", "*.Example.com").normalized_value == "example.com"


def test_public_ip_is_normalized_and_private_ip_is_rejected() -> None:
    assert normalize_identifier("ip", "8.8.8.8").normalized_value == "8.8.8.8"
    with pytest.raises(ValueError, match="globally routable"):
        normalize_identifier("ip", "192.168.1.1")


def test_url_normalization_removes_default_port_and_fragment_but_keeps_query() -> None:
    result = normalize_identifier("url", "HTTPS://Example.com:443/path?q=1#section")
    assert result.normalized_value == "https://example.com/path?q=1"


def test_organization_homonyms_are_never_auto_merged() -> None:
    identifier = normalize_identifier("organization", "  ACME   Group ")
    decision = decide_match(identifier, ["entity-a"])
    assert decision.normalized_value == "acme group"
    assert decision.review_status == "needs_review"
    assert decision.reason == "organization_name_may_be_ambiguous"


def test_multiple_exact_matches_require_review() -> None:
    identifier = normalize_identifier("domain", "example.com")
    decision = decide_match(identifier, ["b", "a", "a"])
    assert decision.matched_entity_ids == ("a", "b")
    assert decision.review_status == "needs_review"


def test_empty_identifier_and_url_credentials_are_rejected() -> None:
    with pytest.raises(ValueError, match="must not be empty"):
        normalize_identifier("domain", "   ")
    with pytest.raises(ValueError, match="without credentials"):
        normalize_identifier("url", "https://user:pass@example.com/")
