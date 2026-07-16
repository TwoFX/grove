# Grove frontend

A single-page application built with [Vite](https://vite.dev), React and
[React Router](https://reactrouter.com) (hash routing).

## Data files

The app loads its data at runtime from two files served next to `index.html`:

- `metadata.json` (required) — the output of the Lean backend
- `invalidated.json` (optional) — upstream invalidated facts; its absence is
  detected at runtime and simply means there are none

For development, place them in `public/`. They can be validated against the
JTD schemas with:

```bash
npm run validate-data
```

(`GROVE_DATA_LOCATION` and `GROVE_UPSTREAM_INVALIDATED_FACTS_LOCATION`
override the default `public/` locations.)

## Development

```bash
npm install
npm run dev
```

## Building

```bash
npm run build    # typechecks, then builds the static site into out/
npm run preview  # serves out/ locally
```

The build is data-independent: `out/` plus the data files is a complete
static site. Because the app uses hash routing (`/#/section/...`) and a
relative asset base, `out/` can be served by any static file server, from
any subpath, with no rewrite configuration. Do not configure an SPA
catch-all rewrite on the host — detecting a missing `invalidated.json`
relies on real 404 responses.
