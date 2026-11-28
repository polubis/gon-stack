---
ticket: VYB-1031
scope: parka/time
summary: Add frequency change to editing a recurring task
why: Recurring expenses let edit change frequency with four scopes, recurring tasks did not.
date: 2026-11-25
tags: [time, recurring]
---

- contract: task DTO gets `recurringInterval`, server-set on list, on edit it is the frequency asked for
- server: `editTaskSeries` splits the rule like expenses do, `all` and first occurrence change in place, `thisAndFollowing` and `following` end the old rule and spawn one from the anchor
- upcoming untouched tasks of the series are dropped and made again on new days, done or started ones stay
- `this` ignores the frequency, UI sends the original one
- UI: `Częstotliwość` select in edit dialog of a recurring task, same four-scope dialog as expenses, delete already used it
- fix: series edit/delete now resets the horizon so the list reloads (was stale until page reload)
- tests: msw dialog tests, real-backend e2e for `thisAndFollowing` and `all`
