# DUCA CTFd Theme

A dark, playful [CTFd](https://ctfd.io) theme for the Deakin University Cybersecurity Association's capture the flag, built to match the [duca.au](https://duca.au) design system.

![Landing page](showcase/img/01-landing.png)

## What you get

- **DUCA look and feel.** Near-black surfaces, hairline borders, pill buttons, the lime accent, and the same type stack as the main site (Archivo, Hanken Grotesk, Space Mono, Silkscreen), self-hosted so nothing loads from a third party.
- **Dark only.** The theme forces dark mode and removes the light/dark toggle.
- **A custom landing page** with the DUCA logo, drifting code characters that scatter away from your cursor, and magnetic buttons. It replaces the stock CTFd index page.
- **Restyled everything else.** Navbar, forms, tables, the challenge board and modal, scoreboard, profiles, notifications, pagination and the Top 10 / score-over-time charts.
- **Small touches.** A scrolling `LEARN. BUILD. BREAK. REPEAT.` ticker in the footer, a spotlight that follows your cursor over challenge tiles, scroll-reveal on cards, and a Konami code. Everything respects `prefers-reduced-motion`.
- **Nothing broken.** It is the stock CTFd core theme with a DUCA layer on top, so all CTFd features keep working.

More screenshots are in the [Screenshots](#screenshots) section below.

## Install on a CTFd server

Built and tested against **CTFd 3.8.x**.

1. Copy the [`theme/`](theme/) directory into your CTFd install as `CTFd/themes/duca-club/`:

   ```bash
   cp -r theme /path/to/CTFd/CTFd/themes/duca-club
   ```

   With Docker, mount it instead:

   ```yaml
   volumes:
     - ./theme:/opt/CTFd/CTFd/themes/duca-club:ro
   ```

2. In CTFd go to **Admin > Config > Theme** and select **duca-club**, then save. (On first-run setup the theme dropdown on the setup page works too.)

3. Set your CTF name, logo and dates in **Admin > Config** as usual. The landing page and navbar pick them up. If you upload a logo it replaces the built-in DUCA mark in the navbar.

## Try it locally

You need Docker with Compose. From the repo root:

```bash
cd testing
docker compose up -d     # CTFd + MariaDB + Redis on http://127.0.0.1:8001
./scripts/seed.sh        # loads the demo dataset (teams, challenges, solves, players)
```

Then open http://127.0.0.1:8001. Logins:

| Role   | Username | Password         |
| ------ | -------- | ---------------- |
| Admin  | `admin`  | `admin-password` |
| Player | `demo`   | `demo-password`  |

These are throwaway local-only credentials that come with the dataset. Details, options and resetting are in [testing/README.md](testing/README.md).

## Repository layout

```
theme/        The CTFd theme. This is the thing you deploy.
  templates/    Jinja templates (CTFd core templates + DUCA changes)
  static/
    assets/     Prebuilt CTFd core JS/CSS (some chart bundles are patched)
    duca/       Everything DUCA: duca.css, duca.js, landing.*, fonts, logo
  sync-min.sh   Regenerates the .min copies CTFd asks for
testing/      Local test stack: docker-compose, demo dataset, scripts/ to seed and reset
showcase/     Screenshots (img/) and the script that regenerates them
```

## Customising

- **Colours and type:** the design tokens are CSS variables at the top of [`theme/static/duca/duca.css`](theme/static/duca/duca.css) (`--duca-lime-fallback`, `--duca-bg`, ...).
- **Footer ticker text and footer links:** [`theme/templates/base.html`](theme/templates/base.html).
- **Landing page:** [`theme/templates/components/landing.html`](theme/templates/components/landing.html), with styles in `landing.css` and behaviour in `landing.js`. It is shown for `/` only and overrides the editable "index" page from the admin panel. To use the admin-editable page instead, delete the `{% if %}` branch in [`theme/templates/page.html`](theme/templates/page.html).
- **After editing `static/duca/*`:** run `theme/sync-min.sh`. CTFd requests `*.min.css` / `*.min.js` outside debug mode, and those files are plain copies.
- **Browser caching:** assets are linked with a `&v=N` query string in `base.html` and `landing.html`. Bump it when you change CSS or JS so returning visitors get the new files.

## How it is built

CTFd's core theme is compiled with Vite, so this theme starts from the prebuilt core output instead of rebuilding it. The DUCA design is added as an overlay (`duca.css`, `duca.js`, `landing.*`) plus edits to a handful of templates. The two chart bundles (`scoreboard.*.js`, `userscore.*.js`) have their ECharts options patched for white text and dark colours, and were renamed (`…duca3.js`) so browsers do not serve cached originals; the manifest and the files that import them are updated to match. If you pull in a newer copy of the core theme's `static/assets`, those patches need reapplying.

## Contributing

Issues and pull requests are welcome. Please include a before/after screenshot for visual changes, and regenerate [`showcase/img/`](showcase/) if the look changes (see [showcase/README.md](showcase/README.md)).

## Credits and licence

Original DUCA work is MIT licensed, see [LICENSE](LICENSE). The CTFd core theme this is based on is Apache 2.0, copyright CTFd LLC, see [theme/LICENSE-CTFd](theme/LICENSE-CTFd). Fonts (Archivo, Hanken Grotesk, Space Mono, Silkscreen) are open source Google Fonts under the SIL Open Font License.

## Screenshots

A quick summary. For larger previews of every page, see [showcase/README.md](showcase/README.md).

| | | |
| :---: | :---: | :---: |
| <a href="showcase/img/01-landing.png"><img src="showcase/img/01-landing.png" alt="Landing page" width="260"></a><br>Landing page | <a href="showcase/img/02-login.png"><img src="showcase/img/02-login.png" alt="Login" width="260"></a><br>Login | <a href="showcase/img/03-register.png"><img src="showcase/img/03-register.png" alt="Register" width="260"></a><br>Register |
| <a href="showcase/img/04-scoreboard.png"><img src="showcase/img/04-scoreboard.png" alt="Scoreboard" width="260"></a><br>Scoreboard | <a href="showcase/img/05-users.png"><img src="showcase/img/05-users.png" alt="Users" width="260"></a><br>Users | <a href="showcase/img/06-team-profile.png"><img src="showcase/img/06-team-profile.png" alt="Team profile" width="260"></a><br>Team profile |
| <a href="showcase/img/07-challenges.png"><img src="showcase/img/07-challenges.png" alt="Challenges" width="260"></a><br>Challenges | <a href="showcase/img/08-challenge-modal.png"><img src="showcase/img/08-challenge-modal.png" alt="Challenge modal" width="260"></a><br>Challenge modal | <a href="showcase/img/09-pagination.png"><img src="showcase/img/09-pagination.png" alt="Pagination" width="260"></a><br>Pagination |
