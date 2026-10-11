---
ticket: none
scope: parka
summary: Theme tokens, dark mode, UX/a11y pass, `APP_ROUTER`/`API_ROUTER`
why: Styling, ui, ux and a11y rule gaps were the same in dashboard and expenses; fixed in both at once
date: 2026-09-29
---

- Router: removed `routes` / `apiRoutes` aliases. Whole app uses `APP_ROUTER` / `API_ROUTER` (pages, modules, server procedures, e2e, tests, docs).
- Styling: `core/style/index.css` = single token file.
  - Vars in `:root` + `prefers-color-scheme: dark` override, exposed via `@theme inline` (`bg-card`, `border-line`, `text-danger`, `bg-overlay`, `on-brand`, `shadow-card`, `z-(--z-modal)`).
  - Raw `bg-white`/`black/N`/`rose-*`/`px`/`shadow-[..]` replaced app-wide (not `shared/cookies`, own dark theme).
  - Bar chart height = `h-32` + `%`.
- Shared `modules/shared/ui`: `Skeleton`, `LoadingBanner`, `ErrorState` (`title : code : description : retry : back`), `Toast` (`useEffectEvent`, auto-dismiss).
- Dashboard + Expenses: skeleton on first load, banner on reload (no data hide - dashboard `load` no longer resets `$data`), `ErrorState` inline + in `ErrorBoundary`, `ERROR_CODES` in constraints. Removed per-module `load-error-fallback.tsx`.
- Expenses: update/delete = optimistic + rollback + toast (`$notice`, `[TRIGGER]_DISMISS_NOTICE`, `concatMap`). Detail = Radix Dialog (focus trap, Escape, title/description). Tests: `expenses-flow.test.tsx`.
- `--color-brand` etc. are vars now; use tokens for new UI.
- Dark palette not contrast-audited.
