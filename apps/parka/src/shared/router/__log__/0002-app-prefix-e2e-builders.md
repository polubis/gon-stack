# 0002 - `/app/` prefix; e2e uses builders

```json
{
  "status": "done"
}
```

- `APP_ROUTER.dashboard` -> `/app/` (keeps `month` query), `APP_ROUTER.expenses` -> `/app/expenses/`. Contract tests updated.
- All e2e specs import `APP_ROUTER`/`API_ROUTER` (user request). Path change = one-file edit.
- Dashboard API mock glob: `API_ROUTER.dashboard({ month: '' })` (empty query dropped; builder needs query).
- `activeNavKeyFromPathname`: dashboard exact match, else `/app/` swallows `/app/expenses/`.
