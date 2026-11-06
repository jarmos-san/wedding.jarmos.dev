# Wedding website

- Buildless static HTML, CSS and browser JavaScript on GitHub Pages. No package installation or build step is required.
- `index.html`: content and metadata; `styles.css`: responsive design; `app.js`: progressive enhancement; `countdown.mjs`: pure IST countdown calculation; `assets/`: invitation, social preview and all-day calendar downloads.
- Preview: `python3 -m http.server 4387 --bind 127.0.0.1`.
- Checks: `node --check app.js`, `node --check countdown.mjs`, `node --test --test-isolation=none tests/countdown.test.mjs`, `git diff --check`.
- Browser regression: `PLAYWRIGHT_MODULE=/absolute/path/to/playwright-core/index.mjs BROWSER_EXECUTABLE=/absolute/path/to/chrome node tests/browser.mjs`. Uses an existing Playwright installation; no runtime dependencies. Serve port 4387 first, or set `PREVIEW_URL`.
- Use arrow functions. Preserve semantic HTML, no-JavaScript navigation/download fallbacks, keyboard interactions and reduced motion support.
- Wedding: 13 December 2026, Kumarghat. Reception: 17 December 2026, Agartala. Exact venues/times are unconfirmed. Countdown targets midnight IST; calendar events are all-day with exclusive next-day end dates.
- Invitation and woven border come from the owner's supplied concept. Preserve the original PNG download; optimize display derivatives with an image tool, never edit generated derivatives by hand.
- Push only feature branches. **Do not merge, push to main, or run the Pages workflow until the owner approves deployment.** Pushes to main automatically deploy the public domain.
