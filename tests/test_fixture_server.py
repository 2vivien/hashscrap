from __future__ import annotations

import http.client
import socket
import urllib.error
import urllib.request
from collections.abc import Iterator

import pytest

from tests.fixture_server import fixture_server


@pytest.fixture
def fixture_base_url() -> Iterator[str]:
    # Generator fixture kept alive for the duration of the test so the server
    # is only shut down after the test finished.
    server = fixture_server()
    try:
        yield next(server)
    finally:
        server.close()


def fetch(url: str, timeout: float = 2.0) -> tuple[int, bytes, dict[str, str]]:
    try:
        with urllib.request.urlopen(url, timeout=timeout) as response:
            return response.status, response.read(), dict(response.headers.items())
    except urllib.error.HTTPError as error:
        return error.code, error.read(), dict(error.headers.items())


def test_home_contains_expected_metadata_and_links(fixture_base_url: str) -> None:
    status, body, headers = fetch(fixture_base_url + "/")
    assert status == 200
    assert headers["Content-Type"].startswith("text/html")
    assert b"Fixture Home" in body
    assert b"Local fixture home" in body
    assert b"/page/2" in body


def test_relative_pagination_fixture_is_stable(fixture_base_url: str) -> None:
    status, body, _ = fetch(fixture_base_url + "/page/2")
    assert status == 200
    assert b"Home via relative link" in body


def test_duplicate_urls_return_identical_content(fixture_base_url: str) -> None:
    assert (
        fetch(fixture_base_url + "/duplicate/a")[1] == fetch(fixture_base_url + "/duplicate/b")[1]
    )


def test_versions_are_different_and_controlled(fixture_base_url: str) -> None:
    old = fetch(fixture_base_url + "/version/1")[1]
    new = fetch(fixture_base_url + "/version/2")[1]
    assert b"Original version" in old
    assert b"Updated version" in new
    assert old != new


@pytest.mark.parametrize(
    ("path", "expected"),
    [
        ("/status/404", 404),
        ("/status/429", 429),
        ("/status/500", 500),
    ],
)
def test_error_status_routes_are_deterministic(
    fixture_base_url: str, path: str, expected: int
) -> None:
    assert fetch(fixture_base_url + path)[0] == expected


def test_safe_redirect_stays_on_fixture_server(fixture_base_url: str) -> None:
    status, body, _ = fetch(fixture_base_url + "/redirect")
    assert status == 200
    assert b"Fixture Home" in body


def test_private_redirect_target_is_exposed_for_policy_tests(fixture_base_url: str) -> None:
    # Use a non-following client so the 302 and its Location header are inspected
    # directly instead of connecting to the private redirect target.
    host, port = fixture_base_url.removeprefix("http://").split(":")
    connection = http.client.HTTPConnection(host, int(port), timeout=2)
    try:
        connection.request("GET", "/redirect/private")
        response = connection.getresponse()
        location = response.getheader("Location")
        assert response.status == 302
        assert location is not None
        assert location.startswith("http://127.0.0.1:")
    finally:
        connection.close()


def test_response_size_route_is_bounded_and_repeatable(fixture_base_url: str) -> None:
    status, body, _ = fetch(fixture_base_url + "/oversized")
    assert status == 200
    assert len(body) == 8192


def test_malformed_html_and_charset_fixtures_are_versioned(fixture_base_url: str) -> None:
    assert b"Unclosed elements" in fetch(fixture_base_url + "/malformed")[1]
    status, body, headers = fetch(fixture_base_url + "/charset/latin1")
    assert status == 200
    assert "iso-8859-1" in headers["Content-Type"]
    assert b"Caf\xe9" in body


def test_timeout_route_exceeds_short_client_timeout(fixture_base_url: str) -> None:
    with pytest.raises((TimeoutError, socket.timeout, urllib.error.URLError)):
        urllib.request.urlopen(fixture_base_url + "/timeout", timeout=0.01)
