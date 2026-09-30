---
version: 1.7
hash: 341efe66eed012c8927256715bc50635fe04f130a38c73c1d86ebb9418dfdd8c
---



# Expenses

Expense list + detail/edit/delete. Cloned from `../dashboard` convention. Backend-only, session required.

## Architecture

1. "configuration" — `constraints.ts` (`FEATURE_NAME`, `FILTER_OPTIONS`), `e2e-ids.ts` (`expenses:*`, `expenses:row:${id}`).
2. "domain" — `models.ts` (branded `ExpenseId`, `CategoryId`, `ReceiptItemId`), `events.ts` (`[TRIGGER]_LOAD/UPDATE/DELETE`), `format.ts`.
3. "core" — `store` (incl. `$notice`), `bus`, `actions/notify`, `handlers/{load,update,delete,dismiss-notice}`, `registry`, `facade`, `mediator`. Update/delete optimistic: snapshot, rollback on failure, toast via `$notice`.
4. "integration" — `repository.ts` (only fetcher, via `API_ROUTER`), `mappers.ts` (DTO → domain).
5. "presentation" — `context.tsx`, `main.tsx` (entry, `ErrorBoundary`), `expense-detail.tsx` (Radix Dialog: focus trap, Escape), `list-skeleton.tsx`, `layout.tsx` (`Card`), `selectors.ts` (`sortByDateDesc`, `groupByMonth`, `sumAmount`). Shared `ErrorState`, `LoadingBanner`, `Toast`, `Skeleton` from `@/shared/ui`. Theme tokens only, no raw colors/px.
6. "index.ts" — exports `Main` only.

## Code

Same as dashboard: `const` + arrows, named exports, `type` aliases, `createX` factories, presentation reaches core via facade only. Mounted by `pages/app/expenses.astro` in `app-layout.astro` (`client:only="react"`). No module shell/nav.
