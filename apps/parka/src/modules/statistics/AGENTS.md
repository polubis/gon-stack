---
version: 0.3
hash: 0973af49470224e90cea1862a626185b095290484117011f038415026ced2b85
---



# Statistics

Read-only stats screen. Fetches expenses + categories on mount, derives
range totals, trend, category donut, month comparison. Auth required, no
offline source. Isolated: no other-module or legacy-store imports.

## Architecture

1. configuration — `constraints.ts` (`FEATURE_NAME`, ranges, `ERROR_CODES`),
   `e2e-ids.ts` (`StatisticsE2eId`).
2. domain — `models.ts` (branded `Month`/`CategoryId`/`ExpenseId`, `Range`,
   `Tab`), `events.ts` (`[TRIGGER]_LOAD`), `format.ts` (money, month math,
   copied helpers).
3. core — `store` (atoms: expenses, categories, initializing, isLoading,
   error), `bus`, `handlers/load`, `registry`, `facade`, `mediator`.
4. integration — `repository.ts` only fetcher (`API_ROUTER.expenses`,
   `categories`), `mappers.ts` DTO -> domain (branded ids).
5. presentation — `context.tsx` Provider; `selectors.ts` (pure client-side derivations over expenses); `main.tsx` view + `ErrorBoundary`;
   `spending.tsx`, `comparison.tsx` tabs; `skeleton.tsx`.
6. `index.ts` exports `Main` only.

## Code

1. `const` + arrows, named exports, `type` only, factory `createX`.
2. Presentation reaches core via facade only; selectors (presentation) run on domain data.
3. `facade.load()` on mount. First load: `StatisticsSkeleton`; reload keeps
   data + `LoadingBanner`; failure: shared `ErrorState` (`STATISTICS_LOAD`).
4. Month = current month (no navigation). Range/tab = view state.
5. Tokens + `cn` only; `BarChart` gets `formatValue={money}`.
6. Shell + bottom nav from `pages/app/statistics.astro`; `Main` = content.

## References

- [presentation/selectors.ts](./presentation/selectors.ts)
- [core/handlers/load.ts](./core/handlers/load.ts)
- [integration/repository.ts](./integration/repository.ts)
- [presentation/main.tsx](./presentation/main.tsx)
