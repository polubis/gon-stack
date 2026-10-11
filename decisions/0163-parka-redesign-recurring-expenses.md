---
ticket: none
scope: parka/recurring
summary: Recurring rules materialize into expenses once due
why: Recurring costs were counted before their day came, so totals and limits showed money not yet spent
date: 2026-10-11
tags: [recurring, expenses, backend, ux]
---

- Rule is an instruction only: interval (weekly, monthly, yearly), startDate, optional endDate, server-set lastMaterializedDate; never summed
  - Migration drops `recurring_payments` and `next_payment_date`; old derived monthly charges become plain expenses and the rule keeps the newest as its mark
- Expense is ordinary with optional `recurring_id` (FK ON DELETE SET NULL) and `occurrence_date`; the UI recurring marker derives from `recurringId`
  - Unique (user, rule, occurrence date) and upsert ignore-duplicates make materialization idempotent and safe in parallel reads
  - Catch-up runs from lastMaterializedDate to the caller's today (plain `YYYY-MM-DD` strings), capped at 1000 per read
  - A deleted charged expense never returns because the mark only moves forward and the client cannot set it
- Materialization is lazy on every read of expenses, recurring and dashboard, when the caller sends `tz`; no `tz` means no charging, so it never charges early
  - pg_cron skipped: not enabled in the local Supabase infra, lazy reads cover the need
  - Trade-off: a first read after weeks closed does the catch-up writes inside a GET
- Upcoming is a pure projection (`upcomingOccurrences`) shown apart with an "Nadchodzący" badge, next payment per rule, max 3 rules, never in sums, limits or the summary
- Edit/delete scope shown before acting
  - Upcoming: "Edytujesz ten i kolejne wydatki", delete confirm says the rule goes and history stays
  - Charged: "tylko ten wydatek", delete confirm says rule and others stay; same note on the edit page
  - Deletes now ask first through a stacked URL modal (ux rule 7, 12, 13)
- Tests: pure occurrence unit tests, UI scope tests, e2e on a fake backend using the real domain code, real Supabase REST spec for catch-up, idempotency, no resurrection
