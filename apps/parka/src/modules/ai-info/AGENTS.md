---
version: 1.2
hash: 02d41c3797a6ca3dfe2f30a6bc976fb4e2ff737ada55ff838e7a960c2c8e7eeb
---



# AI info

Static "how AI works" page. No data, no state: only configuration + presentation. Isolated: imports nothing from other modules.

## Architecture

1. "configuration" — `constraints.ts` (`FEATURE_NAME`, `ERROR_CODES`, `STEPS`), `e2e-ids.ts` (`ai-info:*`).
2. "presentation" — `main.tsx` (entry, `ErrorBoundary`, content only).
3. "index.ts" — exports `Main` only.

## Code

`const` + arrows, named exports, tokens only. Mounted by `pages/app/ai-info.astro`; no module shell/nav.
