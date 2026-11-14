---
ticket: VYB-912
scope: parka/time
summary: Recurring task with end day keeps repeating up to it, form says so
why: VYB-897 turned a recurring task with a deadline into one single task; the owner wants occurrences at the chosen frequency up to the end day and an explicit message.
date: 2026-11-14
tags: [parka, time, recurring, ux]
---

- Read the task (title says expenses, text matches the time task form from VYB-897); expense recurring form already repeats up to its end date, so only the task dialog changed
- Reverted the one-off switch in `task-dialog.tsx`: "Powtarzaj" stays on, field is "Koniec (opcjonalnie)" again and sends `endDate` to the series
- Status notice under the fields states the rule, e.g. "Zadanie dodamy co tydzień od X do Y włącznie." (`time:recurring-end-notice`)
- Restored the end-before-first-day error
- Unit tests for the notice and the saved `endDate`; real-backend e2e step checks occurrences exist on first, second and last day and none after the end
- Proof `.evidences/VYB-912/` (not committed)
