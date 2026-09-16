---
version: 2.2
hash: e11cc9fd85e874bcceeb55e520b5f62253de5da0647c692c6d66aec38572f8e6
---


# Dashboard

Ideal-example module for Parka read-only summary screens. A self-contained,
layer-separated feature: month-scoped expense summary with local/backend data
sources, event-driven state, backend integration, and a state-driven UI. Clone
this module's structure and conventions when building similar dashboard or
overview features.

## Architecture

1. "configuration" — static, framework-facing config. `constraints.ts` holds
   `FEATURE_NAME`, `TREND_MONTHS`, and `QUICK_ACTIONS` nav config; `e2e-ids.ts`
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
4. "integration" — backend boundary. `repository.ts` does the `fetch` call
   for the backend-mode summary; `mappers.ts` derives the same summary shape
   from shared app state for local/offline mode. Nothing else fetches.
5. "presentation" — React only. `context.tsx` provides the facade via
   power-context; `main.tsx` wraps the view in the `Provider` and is the page
   entry; subcomponents (e.g. `quick-action-icon.tsx`) are presentational.
   Components read the facade + shared app state and render; no business
   logic in JSX.
6. "index.ts" — public barrel; re-exports the presentation entry only.

## Code

1. Always `const`; always arrow functions.
2. Named exports only — no default exports.
3. Factory pattern: `createX(...)` returns an object; derive its type with
   `export type X = ReturnType<typeof createX>`.
4. `type` aliases only — no `interface`, no `class`.
5. Events are `[TRIGGER]_NAME` literals; handlers are RxJS
   `ofType('[TRIGGER]_X').pipe(...)`.
6. Presentation reaches core only through the facade (actions + selectors);
   month/expenses/categories/settings come from the shared app store
   (`@/modules/shared/data`) directly, since dashboard doesn't own that state.
7. Local vs backend mode: view checks `getMode()`; when `backend`, it triggers
   `facade.loadSummary(month)` and prefers the fetched result once it matches
   the current month; otherwise it falls back to `integration/mappers.ts`'s
   `toLocalSummary`, which derives the same summary from shared state.
8. Presentation uses shared UI (`AppShell`, `Card`, charts) and formatting
   helpers from `@/modules/shared/*`; styling via design tokens and `cn`.
9. E2e selectors use `dashboard:*` prefix on interactive/readout elements.
10. Imports: `@/` alias for app-root modules; relative paths within this
    module.

## References

- [domain/models.ts](./domain/models.ts) — summary, slice, and quick-action
  types.
- [domain/events.ts](./domain/events.ts) — the trigger event shape.
- [core/mediator.ts](./core/mediator.ts) — how store/registry/facade compose.
- [core/handlers/load-summary.ts](./core/handlers/load-summary.ts) — handler
  (RxJS) pattern.
- [core/facade.ts](./core/facade.ts) — actions + `use*` selector surface.
- [integration/repository.ts](./integration/repository.ts) — fetch boundary.
- [integration/mappers.ts](./integration/mappers.ts) — shared-state → domain
  mapping for local mode.
- [presentation/main.tsx](./presentation/main.tsx) — page layout and wiring.
- [configuration/constraints.ts](./configuration/constraints.ts) — feature
  name, trend window, quick-actions config.
- [configuration/e2e-ids.ts](./configuration/e2e-ids.ts) — module e2e ids.

> Read a reference only when the rule above is unclear.
