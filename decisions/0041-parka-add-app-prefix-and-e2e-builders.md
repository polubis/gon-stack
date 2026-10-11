---
ticket: none
scope: parka/router
summary: "`/app/` prefix; e2e uses builders"
why: One authenticated `/app/*` zone; a path change in e2e becomes a one-file edit instead of many literals
date: 2026-09-29
---

- `APP_ROUTER.dashboard` -> `/app/` (keeps `month` query), `APP_ROUTER.expenses` -> `/app/expenses/`. Contract tests updated.
- All e2e specs import `APP_ROUTER`/`API_ROUTER` (user request). Path change = one-file edit.
- Dashboard API mock glob: `API_ROUTER.dashboard({ month: '' })` (empty query dropped; builder needs query).
- `activeNavKeyFromPathname`: dashboard exact match, else `/app/` swallows `/app/expenses/`.
