#!/usr/bin/env bash
# Optional: generates NEW random data on top of what is already there, using
# CTFd's own populate.py (fake users, teams, challenges, solves, awards, wrong
# submissions), then adds a demo player. Additive; never deletes anything.
# For the standard, repeatable dataset use ./seed.sh instead.
#
#
#   ./seed-random.sh                      # 60 users, 12 teams, 30 challenges
#   USERS=200 TEAMS=30 ./seed-random.sh   # bigger
set -euo pipefail
cd "$(dirname "$0")"

USERS="${USERS:-60}"
TEAMS="${TEAMS:-12}"
CHALLENGES="${CHALLENGES:-30}"
MODE="${MODE:-teams}"             # must match the mode chosen at setup

dc() { docker compose "$@"; }

existing="$(dc exec -T db mariadb -uctfd -pctfd ctfd -N -e 'select count(*) from challenges' | tr -d '[:space:]')"
if [[ "$existing" != 0 && "${FORCE:-0}" != 1 ]]; then
  # populate.py is not safe to run twice (it collides with its own rows)
  echo "Instance already has $existing challenges, skipping populate.py (FORCE=1 to run anyway)."
else
  echo "Installing faker inside the container (not persisted across recreates)..."
  dc exec -T -u root ctfd pip install -q faker

  echo "Generating data..."
  dc exec -T -u root ctfd python populate.py \
    --mode "$MODE" --users "$USERS" --teams "$TEAMS" --challenges "$CHALLENGES" 2>&1 \
    | grep -v -i "RemovedIn20Warning\|Loaded module\|alembic"
fi

echo "Creating the demo player..."
dc exec -T -u root ctfd python - < seed_demo.py 2>&1 | grep -v -i "RemovedIn20Warning\|Loaded module\|alembic"

dc exec -T cache redis-cli flushall >/dev/null
echo "Done. Reload the site."
