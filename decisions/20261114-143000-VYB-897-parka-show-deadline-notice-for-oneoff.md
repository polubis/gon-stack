---
ticket: VYB-897
scope: parka/time
summary: Deadline on a repeating task makes it one-off with a notice
why: A recurring task with a fixed deadline is contradictory, so the form turns repeating off and tells the user.
date: 2026-11-14
tags: [ux, form, recurring, time]
---

- Task form end field is now "Termin (opcjonalnie)"; setting a date switches "Powtarzaj" off and shows a status notice, no rule is created
- Notice uses `role="status"` with an info icon, e2e id `time:recurring-deadline-notice`
- Removed the "end before first day" validation, the end date is never stored by the form
- Interpretation: "deadline" = the recurring end date, the only deadline-like field in the task form
- Unit test replaces the old end-validation test
