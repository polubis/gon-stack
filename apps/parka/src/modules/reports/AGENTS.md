---
version: 0.3
hash: 3007a64730a482e0eb15f392eaef01fd65b2d6f7786235258314a626b71f618b
---



# Reports

Read-only monthly report. Fetches expenses + categories + recurring on
mount, shows month total / category count / active recurring count, offers
CSV and full-text downloads. Auth required. Isolated module.

## Architecture

1. configuration — `constraints.ts` (`FEATURE_NAME`, `ERROR_CODES`),
   `e2e-ids.ts` (`ReportsE2eId`).
2. domain — `models.ts` (branded ids, `ReportSummary`), `events.ts`
   (`[TRIGGER]_LOAD`), `format.ts`.
3. core — `store` (atoms: expenses, categories, recurring, initializing,
   isLoading, error), `bus`, `handlers/load`, `registry`, `facade`,
   `mediator`.
4. integration — `repository.ts` only fetcher (`expenses`, `categories`,
   `recurring`), `mappers.ts` DTO -> domain.
5. presentation — `context.tsx`, `main.tsx` view + `ErrorBoundary`,
   `selectors.ts` (month filter, summary, `buildCsv`, `buildReport`),
   `download.ts` (browser Blob save).
6. `index.ts` exports `Main` only.

## Code

1. `const` + arrows, named exports, `type` only, factory `createX`.
2. `facade.load()` on mount. First load: `Skeleton` in figures; reload keeps
   data + `LoadingBanner`; failure: shared `ErrorState` (`REPORTS_LOAD`).
3. Downloads disabled while initializing or on error.
4. Month = current month (no navigation).
5. Tokens + `cn` only. Shell from `pages/app/reports.astro`.

## References

- [presentation/selectors.ts](./presentation/selectors.ts)
- [core/handlers/load.ts](./core/handlers/load.ts)
- [integration/repository.ts](./integration/repository.ts)
- [presentation/main.tsx](./presentation/main.tsx)
