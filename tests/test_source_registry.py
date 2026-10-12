import pytest

from hashscrap.config import AppConfig
from hashscrap.source_registry import SourceNotFoundError, SourceRegistry


def test_registry_lists_only_enabled_sources() -> None:
    config = AppConfig.model_validate(
        {
            "sources": [
                {
                    "id": "enabled",
                    "name": "Enabled",
                    "base_url": "https://example.org",
                    "allowed_hosts": ["example.org"],
                    "enabled": True,
                },
                {
                    "id": "disabled",
                    "name": "Disabled",
                    "base_url": "https://example.net",
                    "allowed_hosts": ["example.net"],
                    "enabled": False,
                },
            ]
        }
    )
    registry = SourceRegistry(config)
    assert [source.id for source in registry.list_enabled()] == ["enabled"]
    assert registry.get_enabled("enabled").id == "enabled"


@pytest.mark.parametrize("source_id", ["disabled", "missing"])
def test_registry_refuses_disabled_or_unknown_sources(source_id: str) -> None:
    config = AppConfig.model_validate(
        {
            "sources": [
                {
                    "id": "disabled",
                    "name": "Disabled",
                    "base_url": "https://example.org",
                    "allowed_hosts": ["example.org"],
                    "enabled": False,
                }
            ]
        }
    )
    with pytest.raises(SourceNotFoundError, match="not found or disabled"):
        SourceRegistry(config).get_enabled(source_id)
