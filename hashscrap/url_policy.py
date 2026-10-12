"""URL and DNS destination policy for the bounded collector.

This module makes a decision; it does not perform HTTP requests. The downloader must
revalidate every redirect and enforce the resolved destination close to connection time.
"""
from __future__ import annotations

import ipaddress
import socket
from collections.abc import Callable, Iterable
from dataclasses import dataclass
from urllib.parse import urljoin, urlsplit

IPAddress = ipaddress.IPv4Address | ipaddress.IPv6Address
Resolver = Callable[[str, int], Iterable[str]]

BLOCKED_HOSTNAMES = {
    "metadata",
    "metadata.google.internal",
    "metadata.azure.internal",
    "instance-data",
}
ALLOWED_PORTS = {"http": {80}, "https": {443}}


@dataclass(frozen=True)
class URLDecision:
    allowed: bool
    reason: str
    normalized_url: str | None = None
    hostname: str | None = None
    addresses: tuple[str, ...] = ()


class URLPolicyError(ValueError):
    """Raised when a URL fails the network destination policy."""

    def __init__(self, reason: str) -> None:
        super().__init__(reason)
        self.reason = reason


def _system_resolver(hostname: str, port: int) -> Iterable[str]:
    try:
        results = socket.getaddrinfo(hostname, port, type=socket.SOCK_STREAM)
    except socket.gaierror as exc:
        raise URLPolicyError("dns_resolution_failed") from exc
    return {item[4][0] for item in results}


def _parse_ip(value: str) -> IPAddress:
    try:
        return ipaddress.ip_address(value.split("%", maxsplit=1)[0])
    except ValueError as exc:
        raise URLPolicyError("invalid_resolved_ip") from exc


def _public_destination(address: IPAddress) -> bool:
    # is_global excludes private, loopback, link-local, multicast, unspecified,
    # reserved and documentation-only ranges on supported Python versions.
    return address.is_global and not address.is_multicast


def validate_url(
    url: str,
    *,
    resolver: Resolver = _system_resolver,
    allowed_ports: dict[str, set[int]] | None = None,
) -> URLDecision:
    """Validate URL syntax and every DNS answer without making an HTTP request."""
    try:
        parts = urlsplit(url)
        scheme = parts.scheme.lower()
        if scheme not in {"http", "https"}:
            raise URLPolicyError("scheme_not_allowed")
        if not parts.hostname:
            raise URLPolicyError("hostname_missing")
        if parts.username is not None or parts.password is not None:
            raise URLPolicyError("userinfo_not_allowed")
        if parts.fragment:
            raise URLPolicyError("fragment_not_allowed")
        try:
            port = parts.port or (443 if scheme == "https" else 80)
        except ValueError as exc:
            raise URLPolicyError("port_invalid") from exc
        permitted = allowed_ports if allowed_ports is not None else ALLOWED_PORTS
        if port not in permitted.get(scheme, set()):
            raise URLPolicyError("port_not_allowed")
        hostname = parts.hostname.lower().rstrip(".")
        if hostname in BLOCKED_HOSTNAMES or hostname.endswith(".metadata.google.internal"):
            raise URLPolicyError("metadata_hostname_blocked")

        try:
            literal = ipaddress.ip_address(hostname)
        except ValueError:
            literal = None
        if literal is not None:
            addresses = (str(literal),)
        else:
            addresses = tuple(sorted({str(_parse_ip(item)) for item in resolver(hostname, port)}))
            if not addresses:
                raise URLPolicyError("dns_no_addresses")

        parsed_addresses = tuple(_parse_ip(address) for address in addresses)
        if any(not _public_destination(address) for address in parsed_addresses):
            raise URLPolicyError("non_public_destination")

        # Keep the URL's path/query, but normalize the scheme and hostname only.
        netloc = hostname
        if ":" in hostname and not hostname.startswith("["):
            netloc = f"[{hostname}]"
        if port != (443 if scheme == "https" else 80):
            netloc = f"{netloc}:{port}"
        normalized = parts._replace(scheme=scheme, netloc=netloc).geturl()
        return URLDecision(True, "allowed", normalized, hostname, addresses)
    except URLPolicyError as exc:
        return URLDecision(False, exc.reason)
    except (TypeError, ValueError):
        return URLDecision(False, "url_malformed")


def require_allowed_url(url: str, *, resolver: Resolver = _system_resolver) -> URLDecision:
    """Validate a URL or raise a stable, non-sensitive policy error."""
    decision = validate_url(url, resolver=resolver)
    if not decision.allowed:
        raise URLPolicyError(decision.reason)
    return decision


def validate_redirect(
    current_url: str,
    location: str,
    *,
    resolver: Resolver = _system_resolver,
) -> URLDecision:
    """Resolve a redirect Location against the current URL, then apply full policy."""
    try:
        target = urljoin(current_url, location)
    except (TypeError, ValueError):
        return URLDecision(False, "redirect_location_malformed")
    return validate_url(target, resolver=resolver)
