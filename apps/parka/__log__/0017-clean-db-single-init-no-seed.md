# 0017 - clean database: single init migration, no seed

```json
{
  "models": ["claude-sonnet-5-5"],
  "status": "done"
}
```

Cause: prod showed `permission denied for table categories` (no `GRANT` for `authenticated` on hosted Supabase). Prod is not real, so start clean: one `init`, no demo data anywhere.

- Migrations collapsed into `20260929090000_init.sql`: tables, RLS, explicit grants to `authenticated` + default privileges. No seed at all (no trigger, no `seed.sql`; `[db.seed]` disabled). `profiles.name` default `''`.
- Frontend: `shared/data/seed.ts` replaced by `initial-state.ts` (empty lists, current month). Receipt scan no longer injects sample items; starts from an empty draft in the first category. `get-settings` name fallback `''`.
- `db-schema.ts` regenerated; README updated; e2e adapted (flows mock the bootstrap endpoints, real-backend specs start from an empty account).
- Verified: check-types, vitest 20, Playwright 31/31 incl. real backend on a freshly reset local DB.
- Not done: prod DB reset (manual), `genId` client ids kept. Empty-categories case still assumes at least one category in some views (`categories[0]` in limits/recurring/expenses).
- Default categories are not seeded in the DB. The categories screen offers "Sugerowane kategorie" (`modules/categories/configuration/defaults.ts`): one tap adds a default (or all). Stored `name` is a `category.<slug>` symbol; `shared/i18n/category-label.ts` translates it at display time (lists, chips, CSV, charts); renaming stores a plain name.
- Receipt save is disabled without any category or with an item lacking one; notice links to categories. Server schema still requires `categoryId` min 1.
- Verified: check-types, vitest 20, Playwright 33/33 (incl. real backend). Note: a leftover `wrangler dev` from Playwright locks `dist` and makes `pnpm build` fail silently — kill it before building.
