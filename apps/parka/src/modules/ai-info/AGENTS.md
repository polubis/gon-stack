---
version: 1.1
hash: c4a7324b9ef50bd098877361d3e44a32a293ff88ac372b4411371e9a522232ad
---


# AI info

Static "how AI works" page. No data, no state: only configuration + presentation. Isolated: imports nothing from other modules.

## Architecture

1. "configuration" — `constraints.ts` (`FEATURE_NAME`, `ERROR_CODES`, `STEPS`), `e2e-ids.ts` (`ai-info:*`).
2. "presentation" — `main.tsx` (entry, `ErrorBoundary`, content only).
3. "index.ts" — exports `Main` only.

## Code

`const` + arrows, named exports, tokens only. Mounted by `pages/app/ai-info.astro`; no module shell/nav.
