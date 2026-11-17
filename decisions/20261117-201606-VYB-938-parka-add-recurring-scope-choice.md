---
ticket: VYB-938
scope: parka/recurring
summary: One four-scope choice for editing and deleting recurring items
why: Finance and time handled recurring edits and deletes differently; the same four scopes now apply everywhere.
date: 2026-11-17
---

- Scopes (all, only this, this and following, only following) are chosen in one shared dialog after confirming an edit or delete
  - Used for charged expenses (edit page, delete), upcoming payments (edit, delete) and recurring tasks (edit, delete)
  - Replaces the time "end series" button: delete with "only following" does the same
- Contract: optional `scope` on PUT/DELETE of expense, time task and recurring rule (plus `occurrenceDate` for rules); omitted keeps old behavior
- The anchor series is read from the stored row, never trusted from the request
- Charged expenses and tasks are independent rows, so scopes edit or delete those rows and change the rule
  - Not charged yet: the rule is split (old one ends, new one starts with `last_materialized_date`), so charging itself is unchanged and nothing is charged early
  - Chosen over an exclusion table or future-dated rows: no migration, no double count in upcoming
- Delete "all" now also deletes the charged expenses of the series, as the task asks
- Tests: scope helpers, UI flows (unit + mocked e2e), real-backend e2e for all four scopes in finance and time
