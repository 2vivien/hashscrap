# Bounded crawler

## CLI

Install the project and development dependencies, then configure an explicitly scoped source:

```bash
python -m pip install -e ".[dev]"
hashscrap crawl --config examples/sources.json --source example-site
hashscrap crawl --config examples/sources.json --source example-site --url https://example.org/
```

Repeat `--url` to supply multiple starting URLs. If omitted, the configured source base URL is used. The source must be enabled, and every start URL hostname must appear in that source's `allowed_hosts`.

The command emits one JSON object to stdout. It includes intermediate page metadata only (URL, status, content type, byte count, title and link count); raw response bodies are not emitted. No database persistence is included in this command.

## Persisted collection

`hashscrap run` performs the same bounded collection and additionally extracts and persists evidence:

```bash
hashscrap run --config examples/sources.json --source example-site
```

It requires `HASHSCRAP_DATABASE_URL`. The command creates the `sources` row for the configured source, records one `crawl_jobs` row and one `crawl_runs` row, then writes each response as a `documents` row and its observations as `observations` rows, keeping `evidence_ref`, extractor name/version and UTC timestamps. It prints one JSON summary with `responses`, `documents_created`, `documents_updated`, `observations_created`, `failures` and `error_reasons`.

Behavior:

- Re-running the same collection is idempotent: an already stored `original_url` updates `last_seen_at` and the fingerprint instead of duplicating documents, and an observation already stored for that document is not written twice.
- A document that fails extraction is rolled back to a savepoint and counted in `extraction_rejected`; it never aborts the run.
- The job key is unique per invocation. Deduplicating queued work belongs to the durable worker, not to a single command run.
- When an item consumer is attached, response bodies are streamed and dropped instead of accumulated, so memory stays bounded. `hashscrap crawl` keeps its previous in-memory behavior and never attaches bodies to items.

## Bounds and behavior

- Per-source concurrency, per-domain concurrency, delay, timeout, maximum response bytes, depth and page/request budget are applied to Scrapy settings.
- Retry attempts are bounded to two retries. The request budget counts outbound attempts, including retries and redirects, to guarantee an upper bound on requests.
- The URL safety middleware evaluates each outbound request. Redirects are checked again when Scrapy schedules the redirected request.
- Out-of-scope links are not scheduled.
- Robots.txt is obeyed by default. HashScrap does not bypass authentication, paywalls, CAPTCHAs, access controls or source limits.
- HTTP failures and transport errors are represented as bounded collection failures; a future result model will add richer per-request classifications.

## Security boundary

The URL policy rejects non-public DNS/IP destinations and standard-port violations. It is not yet a complete defense against DNS rebinding because the Scrapy transport can resolve the hostname separately from the policy check. Use network egress restrictions as documented in [URL security](URL-SECURITY.md), and do not expose this worker to internal networks. The middleware must be validated in CI and further hardened at the transport connection boundary before production deployment.
