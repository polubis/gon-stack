---
ticket: none
scope: parka
summary: Parka expense saved with real time of day
why: Distinct times per expense, minimal change in the form only
date: 2026-10-10
---

- Expense form no longer saves `T00:00:00.000Z`.
- Chosen day + current local time is sent as ISO (`toTimestamp`).
- Day shown in the input is the local one (`toLocalDateInput`), so late-evening expenses keep their day.
- Scanned draft keeps its original timestamp when the day is unchanged, else day + current time.
- Expense edit (dashboard detail) has no date field, so nothing to change there.
- Recurring `T00:00:00.000Z` left: date-only by design.
- Month bucketing (dashboard/reports `monthOf`, redirect) stays UTC-based, unchanged.
