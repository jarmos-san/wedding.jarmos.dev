# Somraj & Munmun — Wedding in Tripura

A responsive, buildless wedding invitation for 13 December 2026 in Kumarghat and
17 December 2026 in Agartala. Plain HTML, CSS and JavaScript; no backend or runtime
framework dependencies.

## Preview and verification

```sh
python3 -m http.server 4387 --bind 127.0.0.1
node --check app.js
node --check countdown.mjs
node --test --test-isolation=none tests/countdown.test.mjs
git diff --check
```

Open http://127.0.0.1:4387. No compilation or package installation is needed.
Browser tests can use an existing Playwright installation:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright-core/index.mjs \
BROWSER_EXECUTABLE=/absolute/path/to/chrome node tests/browser.mjs
```

The tests cover responsive layouts, navigation, keyboard-operated invitation
preview, downloads, guide disclosures, reduced motion, timezone boundaries and
JavaScript-disabled fallbacks. `PREVIEW_URL` defaults to the local address above.

## Content and assets

- Update wedding copy and metadata in `index.html`.
- Update the midnight-IST countdown target in `countdown.mjs` only if the date changes.
- `assets/wedding.ics` and `assets/reception.ics` intentionally reserve whole days.
  Update both files if dates change; their `DTEND` is the following day.
- Exact venues and timings are unconfirmed. Town-level directions are explicitly
  labelled. Do not add ceremony times or venue pins without confirmation.
- Original invitation PNG and woven SVG border are from the
  [owner's design reference](https://munmun-somraj-wedding-concept.frankhoopoe.chatgpt.site/).
  The WebP is the optimized display version; the original PNG remains downloadable.
- The local 1200×630 social preview supports WhatsApp/Open Graph and Twitter cards.
- Fonts use Google Fonts with system serif/sans-serif fallbacks. All interactive
  code, invitation assets, styles and calendar downloads are served locally.
- Travel references: [Tripura Tourism](https://tripuratourism.gov.in/) and
  [its visitor guide](https://tripuratourism.gov.in/images/documents/1731058221.pdf).
  Live routes and schedules must be checked with transport providers.

## Deployment

The existing GitHub Pages workflow deploys pushes to `main`. Keep review work on
feature branches. Do not merge or manually trigger deployment until the owner
approves the final result.
