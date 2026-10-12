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
    pytest
    ruff check .
    ruff format --check .
    mypy

The CLI currently exposes only help and version. It does not perform network requests or collect data yet.

## Project references

- [Product requirements](docs/PRD.md)
- [AI coding agent execution guide](docs/AI-AGENT-ISSUE-GUIDE.md)
- [Implementation plan](docs/IMPLEMENTATION-PLAN.md)
- [Design system](docs/DESIGN-SYSTEM.md)

## Security

Do not commit credentials, production data, or real environment files. Network collection must not be added until the source policy, URL safety controls, bounded resource limits, and deterministic local test corpus are implemented.
