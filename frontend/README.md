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

## Saving state

Save into the project's Grove directory as before. `Generated.lean` imports the
widget modules, and each widget in `Generated/` now has a small `.lean` loader
and a matching `.json` payload. Commit both files. Selections, rows, fact
metadata, and historical snapshots live in JSON; snapshots no longer contain
Lean source code.

Snapshot values in the frontend use the schema-defined `StateSnapshot` union:
declarations, subexpression declarations or predicates, and successful or failed
synthesis. The save functions convert these tagged values to Lean's saved-state
JSON format. The schema validates each snapshot's fields as well as its tag.

The backend reads the JSON when `restoreState` runs. The loaders resolve their
JSON sibling paths when compiled, so the files must remain in the checkout used
for the build. Rebuild the generated modules if that checkout moves. Missing or
invalid JSON fails restoration with the filename in the error message. Name
migrations still update active selections, leaving historical facts intact.

`restoreState : RestoreStateM Unit` remains the entry point; `RestoreStateM.run`
now returns `IO SavedState`. Table helpers, including assertions, return their
data in `RestoreStateM`. Individual facts are stored in JSON instead of separate
Lean definitions. Pending browser facts with snapshots from an older frontend
must be reasserted before saving in this format.

Run the frontend-to-Lean save/restore checks from the repository root:

```bash
bash scripts/test-json-state.sh
```

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
