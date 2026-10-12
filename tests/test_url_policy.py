from __future__ import annotations

import pytest

from hashscrap.url_policy import URLPolicyError, validate_redirect, validate_url


def public_resolver(hostname: str, port: int) -> tuple[str, ...]:
    assert port in {80, 443}
    return ("93.184.216.34",)


@pytest.mark.parametrize(
    "url",
    [
        "ftp://example.org/",
        "file:///tmp/data",
        "https://user:password@example.org/",
        "https://example.org:8443/",
        "https://example.org:invalid/",
        "https://example.org/#fragment",
        "https:///missing-host",
    ],
)
def test_rejects_malformed_or_disallowed_url_forms(url: str) -> None:
    assert not validate_url(url, resolver=public_resolver).allowed


@pytest.mark.parametrize(
    "url",
    [
        "http://127.0.0.1/",
        "http://10.0.0.1/",
        "http://192.168.1.10/",
        "http://169.254.169.254/",
        "http://0.0.0.0/",
        "http://224.0.0.1/",
        "http://[::1]/",
        "http://[fc00::1]/",
        "http://[fe80::1]/",
        "http://[ff02::1]/",
    ],
)
def test_rejects_non_public_ip_literals(url: str) -> None:
    assert not validate_url(url, resolver=public_resolver).allowed


def test_accepts_public_ipv4_literal() -> None:
    result = validate_url("https://93.184.216.34/path", resolver=public_resolver)
    assert result.allowed
    assert result.addresses == ("93.184.216.34",)


def test_accepts_public_ipv6_literal() -> None:
    result = validate_url("https://[2606:4700:4700::1111]/", resolver=public_resolver)
    assert result.allowed
    assert result.hostname == "2606:4700:4700::1111"


def test_rejects_dns_name_resolving_to_private_ip() -> None:
    result = validate_url("https://example.org/", resolver=lambda _host, _port: ["10.0.0.5"])
    assert not result.allowed
    assert result.reason == "non_public_destination"


def test_rejects_mixed_public_and_private_dns_answers() -> None:
    result = validate_url(
        "https://example.org/",
        resolver=lambda _host, _port: ["93.184.216.34", "192.168.1.8"],
    )
    assert not result.allowed
    assert result.reason == "non_public_destination"


def test_rejects_empty_dns_answers() -> None:
    result = validate_url("https://example.org/", resolver=lambda _host, _port: [])
    assert not result.allowed
    assert result.reason == "dns_no_addresses"


@pytest.mark.parametrize(
    "hostname",
    [
        "metadata",
        "metadata.google.internal",
        "metadata.azure.internal",
        "instance-data",
    ],
)
def test_rejects_metadata_hostnames(hostname: str) -> None:
    result = validate_url(f"http://{hostname}/", resolver=public_resolver)
    assert not result.allowed
    assert result.reason == "metadata_hostname_blocked"


def test_revalidates_redirect_target_including_dns() -> None:
    def resolver(hostname: str, port: int) -> tuple[str, ...]:
        if hostname == "example.org":
            return ("93.184.216.34",)
        return ("127.0.0.1",)

    result = validate_redirect(
        "https://example.org/start",
        "http://internal.example/private",
        resolver=resolver,
    )
    assert not result.allowed
    assert result.reason == "non_public_destination"


def test_relative_redirect_is_resolved_and_validated() -> None:
    result = validate_redirect("https://example.org/a/b", "../next", resolver=public_resolver)
    assert result.allowed
    assert result.normalized_url == "https://example.org/next"


def test_require_allowed_url_raises_stable_reason() -> None:
    from hashscrap.url_policy import require_allowed_url

    with pytest.raises(URLPolicyError) as exc:
        require_allowed_url("http://127.0.0.1/")
    assert exc.value.reason == "non_public_destination"
