---
version: 1.3
hash: ca84d3b0fec53ee59788e65bbe1ca7bf8a31cb21220af2aa64c49755426f8e03
---



# Recurring

Recurring expenses list, active/all filter, expandable detail, tracking toggle. Cloned from `../expenses` convention. Backend-only, session required. Isolated: fetches categories itself (display only).

## Architecture

1. "configuration" — `constraints.ts` (`FEATURE_NAME`, `TAB_OPTIONS`, `ERROR_CODES`), `e2e-ids.ts` (`recurring:*`, `recurring:row:${id}`).
2. "domain" — `models.ts` (branded `RecurringId`, `CategoryId`), `events.ts` (`[TRIGGER]_LOAD/UPDATE/DISMISS_NOTICE`), `format.ts` (`money`, `dateLabel`).
3. "core" — `store` (incl. `$notice`), `bus`, `actions/notify`, `handlers/{load,update,dismiss-notice}`, `registry`, `facade`, `mediator`. Update optimistic; restore previous item on failure; toast via `$notice`.
4. "integration" — `repository.ts` (GET `/api/recurring`, GET `/api/categories`, PUT `/api/recurring/:id`), `mappers.ts`.
5. "presentation" — `context.tsx`, `selectors.ts` (`resolveCategory`, `filterByTab`; plain client-side view logic), `main.tsx` (entry, `ErrorBoundary`), `recurring-detail.tsx`, `list-skeleton.tsx`.
6. "index.ts" — exports `Main` only.

## Code

Same as dashboard/expenses. Mounted by `pages/app/recurring.astro`.
