# 0015 - parka deploy: migrate DB before Worker, drop turbo --affected

```json
{
  "status": "done"
}
```

`deploy-parka.yml`: added `Migrate DB` step (`supabase link` + `supabase db push`,
secrets `PARKA_SUPABASE_ACCESS_TOKEN`, `PARKA_SUPABASE_DB_PASSWORD`,
`PARKA_SUPABASE_PROJECT_REF`) before Worker deploy. Worker deploy now
`turbo run deploy --filter=parka` (no `--affected`).

Reason: new code must not run on old schema; `--affected` may skip deploy on push to main.
