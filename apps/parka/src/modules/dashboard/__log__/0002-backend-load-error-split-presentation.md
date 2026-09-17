# 0002 - backend-only load, error state, presentation split

```json
{
  "status": "done"
}
```

Dashboard data path is backend-only: replace `[TRIGGER]_LOAD_SUMMARY` / `load-summary.ts` with `[TRIGGER]_LOAD` / `load.ts` (AbortSignal, `$data` / `$initializing` / `$isLoading` / `$error`). Repository throws on non-200; mappers map API DTO → branded domain (`Month`, `CategoryId`, `Summary`). Add `domain/format.ts` (money, percent, month nav, `toMonth`). Split presentation: `layout.tsx` (AppShell, Card), `charts.tsx` (BarChart, Donut), `load-error-fallback.tsx`; month from URL param + `client:only` page. Wrap `Main` in `@repo/react-kit` `ErrorBoundary`; e2e id `dashboard:summary-error`. Move quick actions inline; drop local-mode fallback via shared state.

Local/backend dual path hid fetch failures and kept presentation coupled to shared UI/format helpers. Explicit load lifecycle + module-owned UI matches `references/frontend-architecture.md` and surfaces errors for e2e. Consequence: dashboard always hits `/api/dashboard/`; clone this load/error/presentation split for other read-only modules.
