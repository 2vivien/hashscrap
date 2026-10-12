"""Deterministic loopback-only HTTP fixture server for tests."""
from __future__ import annotations

import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Iterator
from urllib.parse import urlsplit


FIXTURE_DIR = Path(__file__).parent / "fixtures" / "corpus"


class FixtureHTTPServer(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True


class FixtureHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, format: str, *args: object) -> None:
        # Test server logs are intentionally quiet and contain no request query strings.
        return

    def _send(self, status: int, body: bytes = b"", content_type: str = "text/html; charset=utf-8") -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_connection_close()
        self.end_headers()
        if body:
            self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802
        path = urlsplit(self.path).path
        if path in {"/", "/index.html"}:
            return self._send(200, (FIXTURE_DIR / "index.html").read_bytes())
        if path == "/page/2":
            return self._send(200, (FIXTURE_DIR / "page-2.html").read_bytes())
        if path in {"/duplicate/a", "/duplicate/b"}:
            return self._send(200, (FIXTURE_DIR / "duplicate.html").read_bytes())
        if path == "/version/1":
            return self._send(200, (FIXTURE_DIR / "version-1.html").read_bytes())
        if path == "/version/2":
            return self._send(200, (FIXTURE_DIR / "version-2.html").read_bytes())
        if path == "/status/404":
            return self._send(404, b"not found", "text/plain; charset=utf-8")
        if path == "/status/429":
            self.send_response(429)
            self.send_header("Retry-After", "0")
            self.send_header("Content-Length", "10")
            self.send_connection_close()
            self.end_headers()
            self.wfile.write(b"rate limit")
            return
        if path == "/status/500":
            return self._send(500, b"server error", "text/plain; charset=utf-8")
        if path == "/redirect":
            self.send_response(302)
            self.send_header("Location", "/")
            self.send_header("Content-Length", "0")
            self.send_connection_close()
            self.end_headers()
            return
        if path == "/redirect/private":
            self.send_response(302)
            self.send_header("Location", "http://127.0.0.1:1/private")
            self.send_header("Content-Length", "0")
            self.send_connection_close()
            self.end_headers()
            return
        if path == "/oversized":
            return self._send(200, b"x" * 8192, "application/octet-stream")
        if path == "/malformed":
            return self._send(200, (FIXTURE_DIR / "malformed.html").read_bytes())
        if path == "/charset/latin1":
            return self._send(200, (FIXTURE_DIR / "latin1.html").read_bytes(), "text/html; charset=iso-8859-1")
        if path == "/timeout":
            # A bounded delay, used only by explicit local timeout tests.
            time.sleep(0.2)
            return self._send(200, b"delayed", "text/plain; charset=utf-8")
        return self._send(404, b"unknown fixture route", "text/plain; charset=utf-8")


def fixture_server() -> Iterator[str]:
    """Yield a loopback base URL and reliably stop the server afterward."""
    server = FixtureHTTPServer(("127.0.0.1", 0), FixtureHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        host, port = server.server_address
        yield f"http://{host}:{port}"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)
