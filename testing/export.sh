#!/usr/bin/env bash
# Re-exports the running instance as the committed seed dataset
# (seed-data/duca-demo.zip). Use after you change the data you want to ship.
# The admin account is replaced and fake file records are dropped, see
# sanitize_export.py. Review `git diff --stat` before committing.
set -euo pipefail
cd "$(dirname "$0")"

tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
dc() { docker compose "$@"; }

echo "Exporting from the running instance..."
dc exec -T ctfd python manage.py export_ctf /tmp/raw.zip >/dev/null 2>&1
dc cp ctfd:/tmp/raw.zip "$tmp/raw.zip"

hash="$(dc exec -T ctfd python -c "from CTFd.utils.crypto import hash_password as h; print(h('admin-password'))" 2>/dev/null | tail -1 | tr -d '\r')"
[[ "$hash" == '$bcrypt-sha256$'* ]] || { echo "could not hash the admin password" >&2; exit 1; }

python3 -I sanitize_export.py "$tmp/raw.zip" seed-data/duca-demo.zip "$hash"
ls -lh seed-data/duca-demo.zip
