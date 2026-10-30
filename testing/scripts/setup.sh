#!/usr/bin/env bash
# First-run CTFd setup (what you would otherwise click through at /setup),
# with the DUCA theme selected. Safe to re-run: it does nothing once set up.
set -euo pipefail

CTFD_URL="${CTFD_URL:-http://127.0.0.1:${CTFD_PORT:-8001}}"
ADMIN_USER="${ADMIN_USER:-admin}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@duca.local}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin-password}"
CTF_NAME="${CTF_NAME:-DUCA CTF}"
USER_MODE="${USER_MODE:-teams}"   # teams | users

jar="$(mktemp)"; trap 'rm -f "$jar"' EXIT

echo "Waiting for CTFd at $CTFD_URL ..."
for _ in $(seq 1 60); do
  code="$(curl -s -o /dev/null -w '%{http_code}' "$CTFD_URL/" || true)"
  [[ "$code" == 200 || "$code" == 302 ]] && break
  sleep 2
done

if [[ "$(curl -s -o /dev/null -w '%{redirect_url}' "$CTFD_URL/setup")" == "$CTFD_URL/" ]]; then
  echo "Already set up, nothing to do."; exit 0
fi

page="$(curl -s -c "$jar" "$CTFD_URL/setup")"
nonce="$(grep -o 'name="nonce"[^>]*value="[^"]*"' <<<"$page" | sed 's/.*value="//;s/"//')"
[[ -n "$nonce" ]] || { echo "Could not read the setup nonce." >&2; exit 1; }

curl -s -b "$jar" -c "$jar" -o /dev/null -w 'setup: HTTP %{http_code}\n' "$CTFD_URL/setup" \
  --data-urlencode "nonce=$nonce" \
  --data-urlencode "ctf_name=$CTF_NAME" \
  --data-urlencode "ctf_description=Capture the flag by the Deakin University Cybersecurity Association" \
  --data-urlencode "user_mode=$USER_MODE" \
  --data-urlencode "challenge_visibility=public" \
  --data-urlencode "account_visibility=public" \
  --data-urlencode "score_visibility=public" \
  --data-urlencode "registration_visibility=public" \
  --data-urlencode "verify_emails=false" \
  --data-urlencode "team_size=4" \
  --data-urlencode "name=$ADMIN_USER" \
  --data-urlencode "email=$ADMIN_EMAIL" \
  --data-urlencode "password=$ADMIN_PASSWORD" \
  --data-urlencode "ctf_theme=duca-club" \
  --data-urlencode "theme_color=" \
  --data-urlencode "start=" --data-urlencode "end=" \
  --data-urlencode "_submit=Finish"

echo "Done. Admin login: $ADMIN_USER / $ADMIN_PASSWORD at $CTFD_URL/login"
