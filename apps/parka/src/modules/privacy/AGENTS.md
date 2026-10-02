---
version: 1.2
hash: 4541bd85373d802bbfe26ffa99d52c5c0f1aa19f82a484a0788146bc4e344a2c
---

# Privacy

Static RODO / privacy info page. No data, no state: only configuration + presentation. Isolated: imports nothing from other modules.

## Architecture

1. "configuration" — `constraints.ts` (`FEATURE_NAME`, `ERROR_CODES`, `POINTS`), `e2e-ids.ts` (`privacy:*`).
2. "presentation" — `main.tsx` (entry, `ErrorBoundary`, content only). Links via `APP_ROUTER`.
3. "index.ts" — exports `Main` only.

## Code

`const` + arrows, named exports, tokens only. Routed by `core/app-router`; no module shell/nav.
