# Local test stack

A throwaway CTFd instance with the DUCA theme mounted in, plus scripts to fill it with believable data. Everything here is for local testing, never production.

Needs Docker with Compose and `curl`. Run commands from this directory.

## Quick start

```bash
docker compose up -d     # CTFd 3.8.9 + MariaDB + Redis -> http://127.0.0.1:8001
./seed.sh                # loads the demo dataset, no setup wizard needed
```

| Role   | Username | Password         |
| ------ | -------- | ---------------- |
| Admin  | `admin`  | `admin-password` |
| Player | `demo`   | `demo-password`  |

## Files

| File                      | What it does |
| ------------------------- | ------------ |
| `docker-compose.yml`      | CTFd, MariaDB and Redis. Mounts `../theme` read-only as the `duca-club` theme. Bound to localhost only. |
| `seed-data/duca-demo.zip` | The demo dataset: a CTFd export with 14 teams, 61 players (including `demo`), 30 challenges with hints, 122 solves, 1,854 submissions, 122 awards and ratings. Theme and settings are already configured. |
| `seed.sh`                 | **Imports the dataset.** Replaces everything in the instance (asks first, `YES=1` to skip), clears the cache and restarts CTFd. |
| `export.sh`               | Re-exports the running instance into `seed-data/duca-demo.zip`. Use it when you change the data you want to ship. |
| `sanitize_export.py`      | Used by `export.sh`: swaps the admin account for `admin`, drops fake file records and writes the zip deterministically. |
| `setup.sh`                | Optional. Runs the `/setup` wizard over HTTP for an empty instance (no demo data). |
| `seed-random.sh`          | Optional. Adds *new* random data on top using CTFd's own `populate.py`, plus the `demo` player. |
| `seed_demo.py`            | Used by `seed-random.sh` to create the `demo` player and team. |
| `reset.sh`                | Stops the stack and deletes all test data after a confirmation prompt. |

## Options

Set these as environment variables.

| Variable                          | Default                       | Used by            |
| --------------------------------- | ----------------------------- | ------------------ |
| `CTFD_PORT`                       | `8001`                        | compose, setup.sh  |
| `DATA_DIR`                        | `./.data`                     | compose, reset.sh  |
| `YES`                             | unset (prompts)               | seed.sh            |
| `ADMIN_USER` / `ADMIN_PASSWORD` / `ADMIN_EMAIL` | `admin` / `admin-password` / `admin@duca.local` | setup.sh |
| `CTF_NAME`                        | `DUCA CTF`                    | setup.sh           |
| `USER_MODE`                       | `teams` (or `users`)          | setup.sh           |
| `USERS` / `TEAMS` / `CHALLENGES`  | `60` / `12` / `30`            | seed-random.sh     |
| `MODE`                            | `teams`, must match `USER_MODE` | seed-random.sh   |
| `DEMO_USER` / `DEMO_PASSWORD`     | `demo` / `demo-password`      | seed_demo.py       |

```bash
USERS=300 TEAMS=40 CHALLENGES=60 ./seed-random.sh   # pile on a big random board
```

## Notes

- **Same data every time.** `seed.sh` imports a fixed export, so screenshots, bug reports and the showcase all line up. It is a full import: everything already in the instance is replaced.
- **The data is lorem ipsum.** Names, descriptions and categories came from Faker, so it is good for testing layout and states, not for realistic copy.
- **No personal data in the zip.** `export.sh` replaces the admin account and drops file records before writing it. Check `git diff --stat` after re-exporting anyway.
- **Uploaded files are not included.** The fake challenges list no downloads.
- **Same CTFd version only.** The export carries CTFd 3.8.9's schema; importing into another version may fail. Bump the image tag in `docker-compose.yml` and re-export together.
- **`seed-random.sh` is not repeatable.** `populate.py` collides with its own rows if run twice; use `reset.sh` then `seed.sh` to start clean.
- **Theme edits show up on refresh.** The theme is bind-mounted. Template changes need `docker compose restart ctfd`; CSS and JS need a hard refresh (or bump the `&v=` number, see the main README). After changing data directly, clear the cache with `docker compose exec cache redis-cli flushall`.
- **The data directory is owned by root** (the containers write it), which is why `reset.sh` deletes it from inside a container.
- **Running two copies side by side:** `COMPOSE_PROJECT_NAME=other CTFD_PORT=8002 DATA_DIR=/some/dir docker compose up -d`.
