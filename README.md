# HashScrap

HashScrap is the bounded collection engine planned for HashCode Intelligence. The initial implementation establishes a Python package and CLI; collection, persistence, and API capabilities are added in subsequent issues.

## Requirements

- Python 3.11 or newer
- pip and venv

## Local development

    python -m venv .venv
    # Linux/macOS
    source .venv/bin/activate
    # Windows PowerShell: .venv\Scripts\Activate.ps1

    python -m pip install --upgrade pip
    python -m pip install -e ".[dev]"

## Commands

    hashscrap --help
    hashscrap --version
    hashscrap crawl --config examples/sources.json --source example-site
    hashscrap jobs status <job-uuid>
    pytest
    ruff check .
    ruff format --check .
    mypy

The CLI exposes a bounded crawl command and a job inspection command. The crawl runs
Scrapy against explicitly configured sources, applies the URL and network destination
policy, and prints intermediate page metadata as JSON. It does not persist results:
persistence and reporting are driven from the Python package.

## Web interface

The `apps/web` directory holds the React interface. See
[docs/PROMPT-HASHSCRAP-FRONTEND.md](docs/PROMPT-HASHSCRAP-FRONTEND.md) for the
implementation conventions and [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) for the
UI contract.

    cd apps/web
    npm install
    npm run dev
    npm run build
    npm run test
    npm run typecheck

The interface is not connected to the engine yet: every screen states that the values
it displays are demonstration data.

## Project references

- [Product requirements](docs/PRD.md)
- [AI coding agent execution guide](docs/AI-AGENT-ISSUE-GUIDE.md)
- [Implementation plan](docs/IMPLEMENTATION-PLAN.md)
- [Design system](docs/DESIGN-SYSTEM.md)

## Security

Do not commit credentials, production data, or real environment files. Network collection must not be added until the source policy, URL safety controls, bounded resource limits, and deterministic local test corpus are implemented.
