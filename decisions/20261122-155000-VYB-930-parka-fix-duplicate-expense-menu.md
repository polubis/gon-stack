---
ticket: VYB-930
scope: parka/dashboard
summary: Fix expense More menu opening twice in show-all modal
why: Card list and show-all modal rendered the same expense with one shared popover key, so one click opened two menus.
date: 2026-11-22
tags: [bugfix, dashboard]
---

- cause: popover open state is URL-keyed by `expense-menu:<id>`, both lists used the same key
- fix: `ExpenseMenu` takes `scope` (`card` or `all`), key is `expense-menu:<scope>:<id>`
- tests: unit (show-all modal gives one menu item, fails before fix) and e2e on built app
