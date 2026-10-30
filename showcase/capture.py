"""Regenerates the screenshots in showcase/img/.

Needs a seeded test instance (see ../testing) and Playwright:

    python -m venv .venv && .venv/bin/pip install playwright
    .venv/bin/python showcase/capture.py                 # uses system Chromium
    CTFD_URL=http://127.0.0.1:8001 .venv/bin/python showcase/capture.py

Set CHROMIUM=/path/to/chromium if it is not on your PATH, or run
`playwright install chromium` and unset CHROMIUM to use Playwright's own.
"""
import os
import shutil
from pathlib import Path

from playwright.sync_api import sync_playwright

URL = os.environ.get("CTFD_URL", "http://127.0.0.1:8001").rstrip("/")
USER = os.environ.get("DEMO_USER", "demo")
PASSWORD = os.environ.get("DEMO_PASSWORD", "demo-password")
OUT = Path(__file__).parent / "img"
OUT.mkdir(exist_ok=True)

# (file name, path, needs login, full page)
PAGES = [
    ("01-landing", "/", False, False),
    ("02-login", "/login", False, False),
    ("03-register", "/register", False, False),
    ("04-scoreboard", "/scoreboard", False, True),
    ("05-users", "/users", False, True),
    ("06-team-profile", "/teams/1", False, True),
    ("07-challenges", "/challenges", True, False),
]


def settle(page, ms=1800):
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(ms)


def scroll_through(page):
    """Scroll down and back up so scroll-reveal content has faded in."""
    height = page.evaluate("document.documentElement.scrollHeight")
    for y in range(0, height, 500):
        page.evaluate(f"window.scrollTo(0, {y})")
        page.wait_for_timeout(120)
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(600)


def main():
    chromium = os.environ.get("CHROMIUM") or shutil.which("chromium") or shutil.which("google-chrome")
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chromium, args=["--no-sandbox"])
        ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()

        # logged-out shots first
        for name, path, needs_login, full in PAGES:
            if needs_login:
                continue
            page.goto(URL + path)
            settle(page)
            if full:
                scroll_through(page)
            page.screenshot(path=str(OUT / f"{name}.png"), full_page=full)
            print("saved", name)

        # log in as the demo player
        page.goto(URL + "/login")
        page.fill("input[name=name]", USER)
        page.fill("input[name=password]", PASSWORD)
        page.click("input[type=submit], button[type=submit]")
        page.wait_for_load_state("networkidle")

        for name, path, needs_login, full in PAGES:
            if not needs_login:
                continue
            page.goto(URL + path)
            settle(page, 2500)
            if full:
                scroll_through(page)
            page.screenshot(path=str(OUT / f"{name}.png"), full_page=full)
            print("saved", name)

        # an open challenge
        tile = page.locator(".challenge-button").first
        if tile.count():
            tile.click()
            page.wait_for_timeout(1200)
            page.screenshot(path=str(OUT / "08-challenge-modal.png"))
            print("saved 08-challenge-modal")

        # pagination
        page.goto(URL + "/users?page=2")
        settle(page, 800)
        page.locator(".duca-pager").scroll_into_view_if_needed()
        page.locator(".duca-pager").screenshot(path=str(OUT / "09-pagination.png"))
        print("saved 09-pagination")

        # phone
        mobile = browser.new_context(
            viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True
        ).new_page()
        mobile.goto(URL + "/")
        settle(mobile)
        mobile.screenshot(path=str(OUT / "10-landing-mobile.png"))
        print("saved 10-landing-mobile")

        browser.close()


if __name__ == "__main__":
    main()
