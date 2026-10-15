"""Command-line entry point for HashScrap."""

from __future__ import annotations

import argparse
import json
import sys
from collections.abc import Sequence

from hashscrap import __version__
from hashscrap.config import load_config

# A job left "running" for longer than this is treated as interrupted by default.
DEFAULT_STALE_AFTER_SECONDS = 3600


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
    jobs = subparsers.add_parser("jobs", help="inspect and recover persisted crawl jobs")
    job_subparsers = jobs.add_subparsers(dest="jobs_command", required=True)
    status = job_subparsers.add_parser("status", help="show one persisted job")
    status.add_argument("job_id", help="UUID of the job")
    recover = job_subparsers.add_parser(
        "recover", help="requeue jobs left running after an interrupted worker"
    )
    recover.add_argument(
        "--stale-after",
        type=int,
        default=DEFAULT_STALE_AFTER_SECONDS,
        help="requeue 'running' jobs idle for more than SECONDS (default: %(default)s)",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    """Run the CLI and return a process exit code."""
    parser = build_parser()
    args = parser.parse_args(argv)
    if args.command is None:
        parser.print_help()
        return 0

    if args.command == "jobs":
        from sqlalchemy.orm import Session

        from hashscrap.db import create_database_engine

        if args.jobs_command == "recover":
            from datetime import UTC, datetime, timedelta

            from hashscrap.jobs import recover_stale_jobs

            if args.stale_after < 0:
                print("hashscrap: --stale-after must not be negative", file=sys.stderr)
                return 2
            try:
                engine = create_database_engine()
                cutoff = datetime.now(UTC) - timedelta(seconds=args.stale_after)
                with Session(engine) as session:
                    recovered = recover_stale_jobs(session, older_than=cutoff)
                    session.commit()
                engine.dispose()
                print(json.dumps({"recovered": recovered}, sort_keys=True))
                return 0
            except (ValueError, RuntimeError) as exc:
                print(f"hashscrap: {exc}", file=sys.stderr)
                return 2
            except Exception:
                # Do not leak job details or driver errors beyond a safe message.
                print(
                    "hashscrap: could not recover jobs; inspect local logs for details",
                    file=sys.stderr,
                )
                return 1

        from uuid import UUID

        from hashscrap.models import CrawlJob

        try:
            job_id = UUID(args.job_id)
            engine = create_database_engine()
            with Session(engine) as session:
                job = session.get(CrawlJob, job_id)
                if job is None:
                    print("hashscrap: job not found", file=sys.stderr)
                    return 2
                print(
                    json.dumps(
                        {
                            "id": str(job.id),
                            "status": job.status,
                            "attempts": job.attempts,
                            "max_attempts": job.max_attempts,
                            "error_code": job.error_code,
                            "created_at": job.created_at.isoformat() if job.created_at else None,
                            "updated_at": job.updated_at.isoformat() if job.updated_at else None,
                        },
                        sort_keys=True,
                    )
                )
            engine.dispose()
            return 0
        except (ValueError, RuntimeError) as exc:
            print(f"hashscrap: {exc}", file=sys.stderr)
            return 2
        except Exception:
            print("hashscrap: could not read job; inspect local logs for details", file=sys.stderr)
            return 1

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
