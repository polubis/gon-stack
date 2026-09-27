# 0012 - expenses module: dashboard-style fetch, full EDA

```json
{
  "models": ["claude-sonnet-5"],
  "status": "done"
}
```

Rebuilt `modules/expenses` off the global `modules/shared/data` store: added
`domain/{models,format,events}.ts`, `integration/repository.ts`
(`fetchExpenses`/`fetchCategories`/`putExpense`/`removeExpense`, typed off
`@schemas/expenses` / `@schemas/categories`), and a full EDA `core` layer
matching `modules/dashboard` — `bus.ts`, `handlers/{load,update,delete}.ts`
(RxJS, abortable load, `catchError` per trigger), `registry.ts`, `mediator.ts`,
`facade.ts` (actions are `trigger(...)` calls). `presentation/context.tsx` uses
`createMediator` + `useLayoutEffect(register)`; `presentation/main.tsx` reads
`useExpenses`/`useCategories`/`useError` from the module's own `Provider` and
calls `ctx.load()` on mount. Added `expenses:load-error` e2e id.

Fixed the e2e regression this caused: `expenses` is now backend-only like
dashboard, so the two anonymous-session `flows.spec.ts` tests that relied on
the removed local demo-seed fallback (`Tauron — Energia`, `Kino Helios`) timed
out. Added an `'i mock the expenses list'` command mocking
`GET/PUT/DELETE /api/expenses/` + `GET /api/categories/`, mirroring the
existing `'i mock the dashboard totals'` pattern. Full suite verified green
after the fix: lint, `astro check`, `vitest`, `astro build`, and the full
Playwright suite (incl. `backend.spec.ts` against real Supabase) all pass.

Each module owning its fetch — own repository, own store, no shared bootstrap
— was the point of this session's rewrite; expenses was the first CRUD (not
read-only) module migrated, so it validates the pattern beyond dashboard's
summary-only case. Consequence: an anonymous visitor to `/expenses/` now gets
a 401 + inline error instead of local demo data, same as `/dashboard/` already
did — flag this if anonymous demo browsing of expenses was expected to keep
working outside e2e. Clone this shape (domain/core/integration/presentation,
full EDA) for the next CRUD module migrated off `shared/data`.
