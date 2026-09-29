# 0015 - theme tokens, dark mode, UX/a11y pass, `APP_ROUTER`/`API_ROUTER`

```json
{
  "models": ["claude-sonnet-5-5"],
  "status": "done"
}
```

- Router: removed `routes` / `apiRoutes` aliases. Whole app uses `APP_ROUTER` / `API_ROUTER` (pages, modules, server procedures, e2e, tests, docs).
- Styling: `core/style/index.css` = single token file. Vars in `:root` + `prefers-color-scheme: dark` override, exposed via `@theme inline` (`bg-card`, `border-line`, `text-danger`, `bg-overlay`, `on-brand`, `shadow-card`, `z-(--z-modal)`). Raw `bg-white`/`black/N`/`rose-*`/`px`/`shadow-[..]` replaced app-wide (not `shared/cookies`, own dark theme). Bar chart height = `h-32` + `%`.
- Shared `modules/shared/ui`: `Skeleton`, `LoadingBanner`, `ErrorState` (`title : code : description : retry : back`), `Toast` (`useEffectEvent`, auto-dismiss).
- Dashboard + Expenses: skeleton on first load, banner on reload (no data hide - dashboard `load` no longer resets `$data`), `ErrorState` inline + in `ErrorBoundary`, `ERROR_CODES` in constraints. Removed per-module `load-error-fallback.tsx`.
- Expenses: update/delete = optimistic + rollback + toast (`$notice`, `[TRIGGER]_DISMISS_NOTICE`, `concatMap`). Detail = Radix Dialog (focus trap, Escape, title/description). Tests: `expenses-flow.test.tsx`.
- Verified: lint, `astro check`, vitest (20), build, Playwright `flows` + `screens` (29, axe light). Not run: dark-mode axe, real-backend specs.

Why: audit items 6-10 (styling/ui/ux/a11y rules) were "same as dashboard" gaps; fixed in both at once. Consequence: dark mode now changes whole app look (light unchanged). `--color-brand` etc. are vars now; use tokens for new UI. Dark palette not contrast-audited.
