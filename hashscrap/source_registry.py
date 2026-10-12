"""In-memory registry for explicitly configured collection sources."""

from __future__ import annotations

from hashscrap.config import AppConfig, Source


class SourceNotFoundError(LookupError):
    """Raised when a source does not exist or is disabled."""


class SourceRegistry:
    def __init__(self, config: AppConfig) -> None:
        self._sources = {source.id: source for source in config.sources}

    def list_enabled(self) -> list[Source]:
        """Return enabled sources in stable ID order."""
        return [source for _, source in sorted(self._sources.items()) if source.enabled]

    def get_enabled(self, source_id: str) -> Source:
        """Resolve a source only if it exists and is enabled."""
        source = self._sources.get(source_id)
        if source is None or not source.enabled:
            raise SourceNotFoundError("source not found or disabled")
        return source
