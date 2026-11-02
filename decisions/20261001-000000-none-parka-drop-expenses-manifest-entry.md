---
ticket: none
scope: parka
summary: Drop expenses module from hashy manifest
why: The module was merged into the dashboard, so its manifest entry is stale
date: 2026-10-01
---

- Removed `apps/parka/src/modules/expenses` from `hashy.modules.txt`: the module was merged into the dashboard (see `0075`).
