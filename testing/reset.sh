#!/usr/bin/env bash
# Stops the stack and deletes ALL local test data (database, uploads, cache).
# The data directory is root-owned, so it is removed from inside a container.
set -euo pipefail
cd "$(dirname "$0")"
DATA_DIR="${DATA_DIR:-./.data}"

read -r -p "Delete $DATA_DIR and all test data? [y/N] " ans
[[ "$ans" == [yY] ]] || { echo "Aborted."; exit 1; }

docker compose down
abs="$(cd "$(dirname "$DATA_DIR")" && pwd)/$(basename "$DATA_DIR")"
docker run --rm -v "$(dirname "$abs"):/w" alpine rm -rf "/w/$(basename "$abs")"
echo "Reset. Run: docker compose up -d && ./setup.sh && ./seed.sh"
