---
name: verify
description: Build, serve, and drive the Grove frontend SPA headlessly to verify changes end-to-end.
---

# Verifying the Grove frontend

The frontend is a Vite + React Router SPA (hash routing). Its surface is the
browser; verify by driving the built site with headless chromium.

## Build and serve

```bash
cd frontend
npm run build                            # tsc --noEmit && vite build -> out/
python3 -m http.server 8377 -d out &     # data files are already in out/ (copied from public/)
```

`public/` must contain `metadata.json` (and optionally `invalidated.json`).
Real entity ids for deep links can be pulled from the data:
sections and widgets live under `rootNode`; see `scripts/validate-data.mjs`
for the file locations.

## Drive

Playwright works with the system browser — no browser download needed:

```js
const { chromium } = require("playwright");
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium-browser",
  headless: true,
});
```

Flows worth driving:
- `/#/` home renders "Test project" tree; `/#/section/<id>`, `/#/facts/<id>`,
  `/#/assertion/<id>`, `/#/association/<id>`, `/#/table/<id>` deep links.
- Bogus ids → NotFound page with working "Back to overview" link.
- In-app navigation must not reload the document or refetch `metadata.json`
  (plant `window.__marker` and count requests).
- Edit flow: on an assertion page, click the Fact-column chip → "Edit fact"
  dialog → change Status listbox → Assert. Header "Save (n)" counter
  increments; survives reload (localStorage); header undo button reverts.
- Subpath serving: serve the parent dir and open `/out/` — must work
  (relative base).
- Delete `invalidated.json` from a served copy — app must load cleanly.

## Gotchas

- The save-to-disk flow needs `showDirectoryPicker` (native dialog) — not
  drivable headless; skip it.
- The status listbox in "Edit fact" is a headlessui Listbox: click the
  button first, then `[role="option"]`.
- Never configure an SPA catch-all rewrite on a test server: missing
  `invalidated.json` must produce a real 404.
