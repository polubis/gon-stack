---
version: 1.3
hash: dbd9ed0a35e73a2c26132cd6fcf04f519fb6cc77a8a6e262e225d24c87251f06
---



# Data export

Download expenses as CSV or text-PDF placeholder. Cloned from `../expenses` convention (read-only subset). Backend-only, session required. Isolated: imports nothing from other modules.

## Architecture

1. "configuration" — `constraints.ts` (`FEATURE_NAME`, `ERROR_CODES`, `FORMATS`), `e2e-ids.ts` (`data-export:*`).
2. "domain" — `models.ts` (branded ids, `Format`, `ExportFile`), `events.ts` (`[TRIGGER]_LOAD`).
3. "core" — `store`, `bus`, `handlers/load`, `registry`, `facade`, `mediator`.
4. "integration" — `repository.ts` (only fetcher: `GET /api/expenses`, `GET /api/categories`), `mappers.ts` (DTO -> minimal domain).
5. "presentation" — `context.tsx`, `main.tsx` (entry, `ErrorBoundary`, `ErrorState`, `LoadingBanner`; export button disabled until data loaded), `selectors.ts` (`toRows`, `toFile`, `dateLabel`; exhaustive over `Format`), `download.ts` (Blob download, DOM side effect).
6. "index.ts" — exports `Main` only.

## Code

`const` + arrows, named exports, `type` aliases, `createX` factories. Loads on mount via `facade.load()`. Mounted by `pages/app/data-export.astro`; no module shell/nav.
