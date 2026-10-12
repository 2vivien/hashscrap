# HashCode Intelligence & HashScrap — PRD v0.1

- **Date:** 2026-10-12
- **Status:** Draft for implementation
- **Repository:** https://github.com/digitaleflex/hashscrap
- **Product owner:** HashCode
- **Strategic model:** hybrid mission, technical OSINT + business intelligence, investigation platform, self-hosted + future SaaS, open-core.

## 1. Executive summary

HashCode Intelligence is a modular platform for collecting, normalizing, correlating and reporting on information from public and authorized sources. A user starts with an indicator (organization, public domain, URL, or dataset), launches a scoped research workflow, and receives observations with source provenance, timestamps, confidence/ambiguity indicators and reproducible reports.

HashScrap is the specialized collection engine inside the wider platform. It is not the whole intelligence platform.

## 2. Problem

Public-source investigations currently require several disconnected tools and manual workflows. This creates duplicate effort, inconsistent data, missing provenance, unreliable entity matching, poor historical comparison and reports that are hard to reproduce.

## 3. Product principles

1. Every collected fact must retain its provenance.
2. Separate raw documents, extracted observations, entities and relationships.
3. Distinguish verified facts, inferred matches and unresolved hypotheses.
4. Prefer deterministic and explainable matching before probabilistic methods.
5. Make connectors replaceable and collection jobs idempotent.
6. Apply network safety, source policies, resource limits and data-retention rules from the beginning.
7. Use existing open-source tools where appropriate instead of rebuilding them.
8. Build one complete workflow before adding many connectors, a graph database or autonomous agents.

## 4. Target users

- OSINT analyst investigating organizations or public digital infrastructure.
- Cybersecurity consultant analyzing assets within an authorized scope.
- Business-intelligence analyst researching organizations and public market information.
- Developer integrating collection through CLI/API.
- Platform administrator managing sources, quotas, access and retention.

## 5. Primary use cases

### UC-01 — Organization/domain investigation
Input a public organization name or authorized domain; select sources; collect and normalize observations; correlate exact identifiers; produce a sourced report.

### UC-02 — Authorized public attack-surface inventory
Collect public DNS, certificate, website and documented technology observations for an explicitly authorized domain. No exploitation or unauthorized active testing in MVP.

### UC-03 — Dataset enrichment
Import CSV/JSON/JSONL, validate identifiers, deduplicate, enrich from configured public sources, export records with provenance and per-record errors.

### UC-04 — Temporal change detection
Repeat a collection, compare content fingerprints and extracted fields, and report additions, changes and removals.

### UC-05 — Multi-source research
Run a bounded workflow across configured connectors and consolidate sourced observations into an investigation.

### UC-06 — Evidence-based reporting
Generate deterministic Markdown and JSON reports containing sources, observation dates, extraction method, known limitations and confidence/match status.

## 6. MVP scope

- Python package and CLI.
- Scrapy-based HTTP collection.
- Explicit URL/source registry and scope policy.
- HTML metadata, title, links and configurable field extraction.
- URL normalization, content fingerprints and deduplication.
- Provenance on every observation.
- PostgreSQL persistence for jobs and observations.
- JSONL, CSV and Markdown exports.
- Bounded retries, per-domain concurrency/rate limits, timeouts and response-size limits.
- SSRF protections enforced both in application code and deployment network policy.
- Structured logs, tests, CI and reproducible benchmark corpus.
- Exact identifier matching only; ambiguous matches are not auto-merged.

## 7. Not in MVP

- Whole-Web indexing or claims of exhaustive coverage.
- Bypassing authentication, paywalls, access controls, CAPTCHAs or source limits.
- Autonomous multi-agent investigations.
- Full dashboard, multi-tenant SaaS or billing.
- Dedicated graph database or vector database.
- Broad personal profiling or collection of unnecessary sensitive data.
- Automated intrusive actions against third-party systems.

## 8. Proposed architecture

CLI/API (API later) -> investigation/job orchestrator -> bounded workers -> Scrapy HTTP collector and future specialized connectors -> normalization/validation -> PostgreSQL (jobs, documents, observations, entities, relationships) plus optional raw-document storage -> correlation/reporting.

Playwright is a future, selective worker for pages that require JavaScript rendering. Redis/distributed workers are deferred until measurements show PostgreSQL-backed scheduling is insufficient. Docker Compose is the initial deployment target.

## 9. Initial data model

- `sources`: source identity, type, base URL, validated policy configuration, enabled state.
- `crawl_jobs`: input URI, source, status, attempts, priority, schedule, idempotency key and bounded error code.
- `crawl_runs`: execution times/status, fetched/failed counts, bytes and configuration snapshot.
- `documents`: canonical URL, content hash, media type, HTTP status, first/last seen, optional raw storage reference, retention deadline.
- `observations`: document/source/run references, observed timestamp, field name, raw and normalized values, extractor/version, evidence reference and validation status.
- `entities`: typed entity and normalized identifier.
- `entity_observations`: entity-observation association, matching method, score and review status.
- `entity_relationships`: source/target entity, relation type, supporting observation, score, validity interval and review status.
- `investigations` and `investigation_items`: investigation metadata and associated tasks/entities/observations.
- `audit_events`: actor, action, resource, timestamp and redacted metadata.

Use UUID identifiers and UTC timestamps. Preserve original values when retention is permitted. Never silently overwrite historical observations. Scores must not be presented as calibrated probabilities unless validated.

## 10. Security and privacy requirements

- SSRF defense: allow only HTTP/HTTPS initially; reject loopback/private/link-local/multicast and cloud metadata addresses; validate DNS resolutions and every redirect; constrain ports; defend against DNS rebinding; enforce network egress restrictions.
- Collection controls: global and per-domain concurrency, rate limits, timeout, maximum response size, maximum depth/pages, bounded retries, cancellation and explicit handling of 429/5xx.
- Data safety: treat fetched pages and files as untrusted; never execute their code; constrain file types/sizes; protect CSV exports from formula injection.
- Secrets: no secrets in Git; use environment configuration/secrets management and redact logs.
- Privacy: purpose limitation, data minimization, retention/deletion rules, access control and auditable exports.
- AI future: web content is untrusted data, not instructions; source citations required; human approval for sensitive actions.
- Scope: active technical collection only with explicit authorization and bounded scope.

## 11. Non-functional requirements

- Reproducible install and Docker Compose deployment.
- Unit, integration, security and benchmark tests.
- Idempotent persistence and recoverable task state.
- Structured logs and clear error categories.
- Measure valid pages/minute, field accuracy/completeness, duplicate rate, resource use and cost per 10,000 valid pages.
- Do not promise a throughput target before benchmarking representative sources.

## 12. MVP acceptance gates

1. A clean environment can install and run the tool from documented instructions.
2. A deterministic local fixture corpus is collected with expected extracted fields.
3. Results export as JSONL/CSV and retain provenance.
4. Retrying or rerunning jobs does not create logical duplicates.
5. SSRF and resource-limit tests cover redirects, private destinations, DNS behavior, oversized responses and timeouts.
6. CI runs lint, type checks and tests.
7. Reports distinguish observations from hypotheses and cite sources.
8. Benchmark results document throughput, success rate, extraction quality, CPU, RAM and storage.
9. No known critical security issue remains unresolved without an explicit risk decision.

## 13. Open-core direction

Core candidate for open source: collector, CLI, core data model, connector interface, normalization, provenance, exports and tests. Potential paid extensions after user validation: hosted service, team workflows, managed connectors, extended monitoring, enterprise support and hosted retention. Essential security controls must not be artificially paywalled.

Choose the actual license explicitly before publishing implementation code; verify dependency licenses. MIT and Apache-2.0 are candidates, not yet a decision.

## 14. Delivery sequence

1. Project foundations and CI.
2. Source registry, URL safety and deterministic fixture server.
3. Bounded Scrapy collection.
4. Extraction, provenance, fingerprints and exports.
5. PostgreSQL persistence and idempotent jobs.
6. Exact-identifier correlation and sourced Markdown report.
7. Security validation and 10k benchmark.
8. 100k workload test only after the MVP is stable.

## 15. Success metrics

- Collection success rate.
- Field extraction accuracy/completeness.
- Duplicate rate.
- Provenance coverage.
- Incorrect entity match rate.
- Retry recovery rate.
- Valid pages/minute and resource use.
- Cost per 10,000 valid pages.
- Time to produce a reproducible sourced report.
