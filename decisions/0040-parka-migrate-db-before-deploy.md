---
ticket: none
scope: parka
summary: "Parka deploy: migrate DB before Worker, drop turbo --affected"
why: New code must not run on old schema; `--affected` may skip deploy on push to main
date: 2026-09-29
---

- `deploy-parka.yml`: added `Migrate DB` step (`supabase link` + `supabase db push`, secrets `PARKA_SUPABASE_ACCESS_TOKEN`, `PARKA_SUPABASE_DB_PASSWORD`, `PARKA_SUPABASE_PROJECT_REF`) before Worker deploy.
- Worker deploy now `turbo run deploy --filter=parka` (no `--affected`).
