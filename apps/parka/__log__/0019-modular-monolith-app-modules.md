# 0019 - modular monolith: isolated modules under `/app`

```json
{
  "status": "done"
}
```

- Removed `modules/shared/data` (global store, 7 GETs on import). Each module loads only its own data on mount via `facade.load()` + own `integration/repository.ts`.
- Rewritten on dashboard/expenses layering: categories, recurring, limits, receipt, notifications, settings, statistics, reports. `info` split into `privacy`, `ai-info`, `data-export`.
- `modules/shared/ui` -> `shared/ui`; `AppShell` dropped (app-layout owns frame + nav); `BarChart` takes `formatValue`.
- Routes under `/app/`: statistics, settings, categories, limits, recurring, reports, notifications, privacy, ai-info, data-export, receipt-scan. Pages in `src/pages/app/`. Public: `/`, sign-in/up, privacy-policy.
- Optimistic mutations + rollback + toast; skeleton first load; `LoadingBanner` on reload; `ErrorState` + `ErrorBoundary`.
- E2E: `__e2e__/session.ts` stubs Supabase session (fixed 6 baseline `/app/*` failures); `mockState` returns 201 on POST.
- Reviewer subagent pass: fixed receipt non-atomic save (expense first, notification best-effort), reports hid data on error, dead `CategoryTag`, ids via `crypto.randomUUID`, stale docs. AGENTS.md stamped via hashy, added to manifest.
- Left: dashboard duplicates charts (isolation), full-list fetches in stats/reports/export, receipt not optimistic (navigates away on success).

Why: startup fan-out of requests and cross-module coupling via global store. Consequence: old flat URLs (`/settings/`, ...) now 404.
