# Configuration and source registry

HashScrap configuration is JSON and is validated before use. The models are independent of Scrapy and PostgreSQL.

## Load and inspect configuration

```python
from hashscrap.config import load_config
from hashscrap.source_registry import SourceRegistry

config = load_config("examples/sources.json")
registry = SourceRegistry(config)
for source in registry.list_enabled():
    print(source.id, source.base_url)
```

An unknown source ID and a disabled source are both rejected by `get_enabled`. The registry is an in-memory configuration registry, not a network client.

## Safety defaults

- HTTP and HTTPS only; credentials and URL fragments are rejected.
- A source's base hostname must appear in its explicit `allowed_hosts` list.
- Unknown fields are rejected.
- Global limits are hard ceilings for per-source limits.
- Defaults are conservative: 10-second timeout, concurrency 2, 1 request/second, depth 2, 100 pages, and 1,000,000 response bytes.
- Maximum supported values are bounded in `hashscrap/config.py`.

The URL model does not perform DNS resolution or prevent SSRF by itself. Do not use these checks as a replacement for the dedicated URL/network policy in issue #4, redirect revalidation, or deployment egress restrictions. Sources should remain disabled until their scope and network policy have been reviewed.

Malformed files and validation failures raise a generic `ValueError` so raw configuration values are not echoed to callers. Detailed validation diagnostics can be added to a privileged local developer interface later without exposing secrets in user-facing logs.
