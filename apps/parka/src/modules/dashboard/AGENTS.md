---
version: 2.14
hash: 9747ec9f309aa33e96f3efc471587dbdfa87afb7d38a673614a36ea5abaeba62
---

# Dashboard

Ideal-example module for Parka read-only summary screens. A self-contained,
layer-separated feature: month + range expense summary (range picker, trend, donut, month comparison) fetched from the
backend, plus an expenses section (list, filter, detail/edit/delete) with its own load lifecycle; event-driven state, backend integration, and a state-driven UI.
Requires an authenticated session — there is no local/offline data source.
Clone this module's structure and conventions when building similar dashboard
or overview features.

## Architecture

1. "configuration" — static, framework-facing config. `constraints.ts` holds
   `FEATURE_NAME`, `DEFAULT_RANGE`, `RANGES`, `RANGE_LABEL`, `FILTER_OPTIONS`, `UNCATEGORIZED`; `e2e-ids.ts`
   holds module e2e selector ids (combined at app root). No business logic,
   no state.
2. "domain" — pure domain types. `models.ts` uses plain object shapes and
   string-literal unions (`DashboardSummary`, `QuickAction`); `events.ts` is
   the `Event` union of `TriggerEvent`s. No transport, persistence, or React
   concerns.
3. "core" — state + business logic. `store.ts` (atom), `bus.ts` (event bus
   over the domain `Event`), `handlers/` (one file per trigger), `registry.ts`
   (wires handlers to the bus), `facade.ts` (actions + `use*` selectors),
   `mediator.ts` (composes store + registry + facade).
4. "integration" — backend boundary. `repository.ts` calls
   `API_ROUTER.dashboard({ month })` from `@/shared/router` (`GET
/api/dashboard`, private, session-scoped); `mappers.ts` converts
   the response DTO into the domain `Summary` shape. Nothing else fetches.
5. "presentation" — React only. `context.tsx` provides the facade via
   power-context; `main.tsx` wraps the view in the `Provider` and is the page
   entry; subcomponents (e.g. `quick-action-icon.tsx`) are presentational.
   `layout.tsx` holds only the module-local `Card`; the page shell and bottom
   nav are not module-owned (see point 8). Components read the facade and
   render; no business logic in JSX.
6. "index.ts" — public barrel; re-exports the presentation entry only.

## Code

1. Always `const`; always arrow functions.
2. Named exports only — no default exports.
3. Factory pattern: `createX(...)` returns an object; derive its type with
   `export type X = ReturnType<typeof createX>`.
4. `type` aliases only — no `interface`, no `class`.
5. Events are `[TRIGGER]_NAME` literals; handlers are RxJS
   `ofType('[TRIGGER]_X').pipe(...)`.
6. Presentation reaches core only through the facade (actions + selectors).
   The selected month is the view's own state, seeded from the `month` URL
   query param (falling back to the current calendar month) and kept in sync
   with it; dashboard imports no other module.
7. On mount and on every month change, the view triggers `facade.load(month)`,
   which fetches the summary from the backend. There is no local/offline
   fallback — an anonymous session gets a 401 and the view renders the shared
   `ErrorState` (title : `ERROR_CODES` tech-code : description : retry : back)
   for `$error`; `Main` wraps the view in an `ErrorBoundary` with the same
   component. First load shows `Skeleton` placeholders mirroring the layout
   (`$initializing`); later loads keep current data and show `LoadingBanner`
   (`$isLoading`) — `load` never clears `$data`.
8. No module-owned `AppShell`/bottom nav: `core/app-router` (TanStack Router, route `/app/`) renders `Main`
   inside its shell (`client:only="react"`), which renders
   the sidebar/bottom frame and `shared/navigation/app-nav`
   `SyncedAppNav`. `Main` renders page content only. Presentation uses the
   local `Card` (`./layout`), shared charts, and formatting helpers from
   `@/shared/*` (incl. `ui`: `Skeleton`, `LoadingBanner`, `ErrorState`);
   styling via theme tokens only (`core/style/index.css`: `bg-card`,
   `text-danger`, `z-(--z-modal)` ...) and `cn` — no raw colors/px.
9. E2e selectors use `dashboard:*` prefix on interactive/readout elements (expenses section: `dashboard:expense:${id}`, `dashboard:detail`, `dashboard:save` ...).
   The expenses section loads via `[TRIGGER]_LOAD_EXPENSES` into `$expenses`/`$categories`/`$expensesInitializing`/`$expensesLoading`/`$expensesError`; update/delete are optimistic (snapshot, rollback, toast via `$notice`). `presentation/expenses.tsx`, `expense-detail.tsx` (Radix Dialog), `expenses-skeleton.tsx`, `selectors.ts`.
10. Imports: `@/` alias for app-root modules; relative paths within this
    module.

## References

- [domain/models.ts](./domain/models.ts) — summary, slice, and quick-action
  types.
- [domain/events.ts](./domain/events.ts) — the trigger event shape.
- [core/mediator.ts](./core/mediator.ts) — how store/registry/facade compose.
- [core/handlers/load.ts](./core/handlers/load.ts) — handler (RxJS) pattern,
  incl. abort/loading/error state.
- [core/facade.ts](./core/facade.ts) — actions + `use*` selector surface.
- [integration/repository.ts](./integration/repository.ts) — fetch boundary.
- [integration/mappers.ts](./integration/mappers.ts) — response DTO → domain
  `Summary` mapping.
- [presentation/main.tsx](./presentation/main.tsx) — page layout and wiring.
- [configuration/constraints.ts](./configuration/constraints.ts) — feature
  name, trend window, quick-actions config.
- [configuration/e2e-ids.ts](./configuration/e2e-ids.ts) — module e2e ids.

> Read a reference only when the rule above is unclear.
