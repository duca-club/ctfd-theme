#!/usr/bin/env bash
# Loads the standard demo dataset (seed-data/duca-demo.zip): fake teams and
# players, challenges with hints, solves, wrong submissions, awards, and a demo
# player. Same data every time, so screenshots and bug reports line up.
#
# THIS REPLACES EVERYTHING in the instance, including accounts and settings.
#
#   ./scripts/seed.sh          # asks first
#   YES=1 ./scripts/seed.sh    # no prompt
#
# Works on a brand new instance (no ./scripts/setup.sh needed) and on one that is
# already set up. Logins afterwards:
#   admin / admin-password      demo / demo-password
set -euo pipefail
cd "$(dirname "$0")/.."   # run from testing/, where docker-compose.yml lives

zip="seed-data/duca-demo.zip"
[[ -f "$zip" ]] || { echo "missing $zip" >&2; exit 1; }
dc() { docker compose "$@"; }

if [[ "${YES:-0}" != 1 ]]; then
  read -r -p "This wipes the instance and loads the demo dataset. Continue? [y/N] " ans
  [[ "$ans" == [yY] ]] || { echo "Aborted."; exit 1; }
fi

echo "Importing $zip ..."
dc cp "$zip" ctfd:/tmp/seed.zip
dc exec -T -u root ctfd python manage.py import_ctf /tmp/seed.zip 2>&1 \
  | grep -v -i "RemovedIn20Warning\|Loaded module\|alembic" || true

dc exec -T cache redis-cli flushall >/dev/null
dc restart ctfd >/dev/null
echo "Done. Log in at http://127.0.0.1:${CTFD_PORT:-8001}  (admin / admin-password, demo / demo-password)"
