# Local HTTP fixture corpus

All HTML files here are synthetic and contain no personal data. They are versioned test inputs, not production data.

| Fixture | Purpose |
| --- | --- |
| `corpus/index.html` | Title, metadata, canonical link, stable field, and pagination link |
| `corpus/page-2.html` | Relative link resolution |
| `corpus/duplicate.html` | Identical body served at multiple URLs |
| `corpus/version-1.html`, `version-2.html` | Controlled content change |
| `corpus/malformed.html` | Malformed HTML parser behavior |
| `corpus/latin1.html` | Non-UTF-8 charset decoding |

Run the deterministic fixture tests with `python -m pytest tests/test_fixture_server.py`. The server binds to loopback on an OS-assigned port and is shut down by the fixture even when a test fails. No public websites are contacted.
