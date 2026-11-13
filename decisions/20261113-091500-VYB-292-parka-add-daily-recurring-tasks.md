---
ticket: VYB-292
scope: parka/time
summary: Recurring tasks can repeat every day
why: Ticket had no description and a typo ("pomagania zdania codziennie"); read as "powtarzania zadania codziennie", because tasks only repeated weekly, monthly or yearly.
date: 2026-11-13
tags: [parka, time, recurring]
---

- Assumption: "repeat task daily", not "skip an occurrence" (deleting one occurrence already works and stays gone); stated on ticket and PR
- New interval `daily` for tasks only: `TaskRecurringInterval` in `shared/recurring/occurrences`, `timeRecurringInterval` in contract; expenses keep weekly/monthly/yearly
- Migration `20261113090000_time_recurring_daily.sql` widens the `time_recurring` interval check
- Form: "Co dzień" option in "Częstotliwość"
- Tradeoff: materialization runs to the horizon (end of viewed year), so a daily rule makes up to ~365 tasks at once; under the 1000 catch-up cap
- Tests: occurrence generation, contract accepts daily / rejects unknown, form flow (msw) sends `daily`
- Evidence: text proof of test run
