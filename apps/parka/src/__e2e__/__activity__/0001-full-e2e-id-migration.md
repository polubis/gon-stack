---
id: 0001
document: 0001-full-e2e-id-migration.md
decision_ref: __decision__/0001-full-e2e-id-migration.md
---

# 0001 — full per-module e2e id migration

**Progress**: completed. Added `configuration/e2e-ids.ts` for auth, dashboard, receipt, expenses, statistics, limits/goals, recurring, reports, notifications, settings, categories, info (privacy/ai-info/data-export), cookies. Rewrote `selectors.d.ts` to union all module types. Updated dynamic DOM attrs with `${string | number}` suffixes. Adjusted receipt e2e specs for regex item selectors. `pnpm check-types` green.
