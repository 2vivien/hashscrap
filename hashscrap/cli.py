"""Command-line entry point for HashScrap."""
from __future__ import annotations

import argparse
import json
import sys
from collections.abc import Sequence

from hashscrap import __version__
from hashscrap.config import load_config


def build_parser() -> argparse.ArgumentParser:
    """Build the command-line parser."""
    parser = argparse.ArgumentParser(
        prog="hashscrap",
        description="HashScrap — bounded, provenance-first web collection engine.",
    )
    parser.add_argument(
        "--version",
        action="version",
        version=f"%(prog)s {__version__}",
        help="show the installed version and exit",
    )
    subparsers = parser.add_subparsers(dest="command")
    crawl = subparsers.add_parser("crawl", help="collect a bounded set of URLs")
    crawl.add_argument("--config", required=True, help="path to validated JSON configuration")
    crawl.add_argument("--source", required=True, help="enabled source ID from the configuration")
    crawl.add_argument(
        "--url",
        action="append",
        dest="urls",
        default=[],
        help="explicit start URL; repeat for multiple URLs (defaults to source base URL)",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    """Run the CLI and return a process exit code."""
    parser = build_parser()
    args = parser.parse_args(argv)
    if args.command != "crawl":
        parser.print_help()
        return 0

    try:
        config = load_config(args.config)
        from hashscrap.crawler import collect
        from hashscrap.source_registry import SourceRegistry

        source = SourceRegistry(config).get_enabled(args.source)
        urls = args.urls or [source.base_url]
        result = collect(config, args.source, urls)
    except (OSError, ValueError, LookupError) as exc:
        print(f"hashscrap: {exc}", file=sys.stderr)
        return 2
    except Exception:
        # Do not dump request URLs, response bodies, or arbitrary exception details.
        print("hashscrap: collection failed; inspect local logs for details", file=sys.stderr)
        return 1

    print(json.dumps(result.to_dict(), ensure_ascii=False, sort_keys=True))
    return 0 if result.failures == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
