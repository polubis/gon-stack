---
ticket: none
scope: parka
summary: "Clean database: single init migration, no seed"
why: Prod showed `permission denied for table categories` (no GRANT for `authenticated`); prod is not real, so start clean with one init
date: 2026-09-29
---

- Migrations collapsed into `20260929090000_init.sql`: tables, RLS, explicit grants to `authenticated` + default privileges. No seed at all (no trigger, no `seed.sql`; `[db.seed]` disabled). `profiles.name` default `''`.
- Frontend: `shared/data/seed.ts` replaced by `initial-state.ts` (empty lists, current month). Receipt scan no longer injects sample items; starts from an empty draft in the first category. `get-settings` name fallback `''`.
- `db-schema.ts` regenerated; README updated; e2e adapted (flows mock the bootstrap endpoints, real-backend specs start from an empty account).
- Not done: prod DB reset (manual), `genId` client ids kept. Empty-categories case still assumes at least one category in some views (`categories[0]` in limits/recurring/expenses).
- Default categories are not seeded in the DB.
  - The categories screen offers "Sugerowane kategorie" (`modules/categories/configuration/defaults.ts`): one tap adds a default (or all).
  - Stored `name` is a `category.<slug>` symbol; `shared/i18n/category-label.ts` translates it at display time (lists, chips, CSV, charts); renaming stores a plain name.
- Receipt save is disabled without any category or with an item lacking one; notice links to categories. Server schema still requires `categoryId` min 1.
