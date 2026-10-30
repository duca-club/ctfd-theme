# Showcase

Screenshots of the DUCA theme running against the demo dataset (`testing/seed-data/duca-demo.zip`), 1440px wide (the phone shot is 390px at 2x).

## Landing page

Landing page. The DUCA logo, drifting code characters that scatter away from the cursor, and magnetic buttons.

![Landing page](img/01-landing.png)

## Login

Login.

![Login](img/02-login.png)

## Register

Register.

![Register](img/03-register.png)

## Scoreboard

Scoreboard with the Top 10 chart, bracket filters and the standings table.

![Scoreboard](img/04-scoreboard.png)

## Users

Users list.

![Users](img/05-users.png)

## Team profile

Team profile with the score-over-time chart, awards and solves.

![Team profile](img/06-team-profile.png)

## Challenges

Challenge board, logged in as the demo player.

![Challenges](img/07-challenges.png)

## Challenge modal

An open challenge: tabs, hints and flag submission.

![Challenge modal](img/08-challenge-modal.png)

## Pagination

Pagination control.

![Pagination](img/09-pagination.png)

## Landing (mobile)

Landing page on a phone.

![Landing (mobile)](img/10-landing-mobile.png)

## Regenerating

Start the test stack and load the dataset (`docker compose up -d && ./scripts/seed.sh` in [../testing](../testing)), then:

```bash
python -m venv .venv
.venv/bin/pip install playwright
.venv/bin/python showcase/capture.py
```

The script logs in as the seeded `demo` player. It uses the Chromium on your `PATH`; set `CHROMIUM=/path/to/chromium` to pick another, or run `.venv/bin/playwright install chromium` and unset it. Point it at a different instance with `CTFD_URL=http://127.0.0.1:8002`.

The dataset is fixed, so re-running produces the same teams and scores.
