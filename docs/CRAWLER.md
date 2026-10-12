# Bounded crawler

## CLI

Install the project and development dependencies, then configure an explicitly scoped source:

```bash
python -m pip install -e ".[dev]"
hashscrap crawl --config examples/sources.json --source example-site
hashscrap crawl --config examples/sources.json --source example-site --url https://example.org/
```

Repeat `--url` to supply multiple starting URLs. If omitted, the configured source base URL is used. The source must be enabled, and every start URL hostname must appear in that source's `allowed_hosts`.

The command emits one JSON object to stdout. It includes intermediate page metadata only (URL, status, content type, byte count, title and link count); raw response bodies are not emitted. No database persistence is included in this issue.

## Bounds and behavior

- Per-source concurrency, per-domain concurrency, delay, timeout, maximum response bytes, depth and page/request budget are applied to Scrapy settings.
- Retry attempts are bounded to two retries. The request budget counts outbound attempts, including retries and redirects, to guarantee an upper bound on requests.
- The URL safety middleware evaluates each outbound request. Redirects are checked again when Scrapy schedules the redirected request.
- Out-of-scope links are not scheduled.
- Robots.txt is obeyed by default. HashScrap does not bypass authentication, paywalls, CAPTCHAs, access controls or source limits.
- HTTP failures and transport errors are represented as bounded collection failures; a future result model will add richer per-request classifications.

## Security boundary

The URL policy rejects non-public DNS/IP destinations and standard-port violations. It is not yet a complete defense against DNS rebinding because the Scrapy transport can resolve the hostname separately from the policy check. Use network egress restrictions as documented in [URL security](URL-SECURITY.md), and do not expose this worker to internal networks. The middleware must be validated in CI and further hardened at the transport connection boundary before production deployment.
