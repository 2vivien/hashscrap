# URL and network destination security

## Application policy

`hashscrap.url_policy.validate_url` is a pure decision interface around URL parsing and an injectable DNS resolver. It permits only HTTP/HTTPS on the standard ports, rejects URL credentials and fragments, blocks known metadata hostnames, and rejects a URL if any resolved address is not globally routable. Mixed public/private DNS answers are rejected rather than partially accepted.

Use `validate_redirect(current_url, location)` on every redirect before following it. Do not let the HTTP client automatically follow redirects without this check. Keep rejection reasons as stable codes; do not log credentials, full sensitive query strings, or raw untrusted input.

## Important limitations

- Validation and the eventual TCP connection can resolve a hostname at different times. This module alone does **not** prevent DNS rebinding.
- The eventual downloader must connect to a validated address (or use a resolver/transport that guarantees the checked address is the one used) while preserving the correct Host header and TLS SNI.
- Revalidate every redirect, including relative redirects, and enforce the same policy at connection time.
- The module is not yet wired into a Scrapy downloader. Issue #6 must integrate a downloader middleware/handler that applies the decision before each request and redirect.
- Unit tests inject a deterministic resolver and do not make public DNS or HTTP requests.

## Deployment egress defense

Application checks must be complemented by network controls:
- Deny access from the collector to loopback, private/internal, link-local, multicast, unspecified, and cloud metadata ranges at the host/container/VPC firewall layer.
- Block metadata service endpoints explicitly for both IPv4 and IPv6.
- Restrict outbound protocols to HTTP/HTTPS and standard destination ports; do not expose a route from the worker into database/admin networks.
- Use a controlled DNS resolver and monitor unexpected destination attempts.
- Keep PostgreSQL on a private Docker network and do not publish its port to the public interface.
- Re-test the egress policy from inside the actual worker container after deployment changes.

The local fixture server uses loopback only in tests. That exception must not be enabled in production configuration.
