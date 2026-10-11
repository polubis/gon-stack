---
ticket: none
scope: parka/e2e
summary: Full per-module e2e id migration
why: Wildcard `module:${string}` e2e ids compiled any suffix, so typos in ids failed only at runtime
date: 2026-09-14
---

- Added `configuration/e2e-ids.ts` for auth, dashboard, receipt, expenses, statistics, limits/goals, recurring, reports, notifications, settings, categories, info (privacy/ai-info/data-export), cookies.
- Rewrote `selectors.d.ts` to union all module types.
- Updated dynamic DOM attrs with `${string | number}` suffixes.
- Adjusted receipt e2e specs for regex item selectors.
- Each module (and `shared/cookies`) owns static ids in `as const` arrays; repeated DOM nodes use `` `prefix:name:${string | number}` `` suffixes (rows, receipt item fields, statistics range tabs).
- Root `selectors.d.ts` unions imported module types only — no wildcards, no inline cookie literals.
- Receipt item inputs use a regex prefix in specs because item ids are runtime-generated.
- Consequence: typos in static ids fail compile; dynamic ids require correct prefix + suffix shape, not arbitrary strings.
