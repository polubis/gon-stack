# 0001 - full per-module e2e id migration

```json
{
  "status": "done"
}
```

Added `configuration/e2e-ids.ts` for auth, dashboard, receipt, expenses, statistics, limits/goals, recurring, reports, notifications, settings, categories, info (privacy/ai-info/data-export), cookies. Rewrote `selectors.d.ts` to union all module types. Updated dynamic DOM attrs with `${string | number}` suffixes. Adjusted receipt e2e specs for regex item selectors. `pnpm check-types` green.

Migrated all parka `data-e2e` selectors off `` `module:${string}` `` wildcards to per-module `configuration/e2e-ids.ts`, with partial type-safe dynamic ids. Each module (and `shared/cookies`) owns static ids in `as const` arrays; repeated DOM nodes use `` `prefix:name:${string | number}` `` suffixes (rows, receipt item fields, statistics range tabs). Root `selectors.d.ts` unions imported module types only — no wildcards, no inline cookie literals. Receipt item inputs use a regex prefix in specs because item ids are runtime-generated. Consequence: typos in static ids fail compile; dynamic ids require correct prefix + suffix shape, not arbitrary strings.
