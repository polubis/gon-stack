---
version: 1.1
hash: 12b29ff190f45ff2312c2b8f96d343a8b9d3eb6c0337b0fbb25154f7f6559980
---

# Privacy

Static RODO / privacy info page. No data, no state: only configuration + presentation. Isolated: imports nothing from other modules.

## Architecture

1. "configuration" — `constraints.ts` (`FEATURE_NAME`, `ERROR_CODES`, `POINTS`), `e2e-ids.ts` (`privacy:*`).
2. "presentation" — `main.tsx` (entry, `ErrorBoundary`, content only). Links via `APP_ROUTER`.
3. "index.ts" — exports `Main` only.

## Code

`const` + arrows, named exports, tokens only. Mounted by `pages/app/privacy.astro`; no module shell/nav.
