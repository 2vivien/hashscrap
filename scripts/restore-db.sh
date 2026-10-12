#!/bin/sh
set -eu

if [ "$#" -ne 1 ] || [ ! -f "$1" ]; then
  echo "Usage: $0 path/to/backup.dump" >&2
  exit 2
fi

echo "WARNING: this replaces objects in the target database."
echo "Ensure the target database is empty or that you have a verified backup."
docker compose exec -T db sh -ec 'pg_restore --clean --if-exists --no-owner -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < "$1"
printf 'Restore completed from: %s\n' "$1"
