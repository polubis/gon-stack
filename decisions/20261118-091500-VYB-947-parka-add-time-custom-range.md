---
ticket: VYB-947
scope: parka/time
summary: Add own range kind to the time views like finance
why: Finance offers day, week, month, year and own range; time lacked the fifth, so a user could not read tasks and stats for any span.
date: 2026-11-18
tags: [time, period]
---

- TimeKind gets custom; route /app/time/range/?from&to under the same layout, so the store survives kind switches.
- Anchor stays the first day; context keeps rangeTo, so rangeOf, periodTitle and taskStats take an optional last day.
- Range view lists only days with tasks, oldest first; stats buckets are daily up to 92 days, monthly beyond.
- Moves card counts moves made inside the range (history instants), so a range must reach today to show today's moves.
- PeriodRangeDialog moved to shared/period-control with own dialog shell and period-control:range-* e2e ids; dashboard keeps today as the last day.
- Time passes last = today + 366 days, because tasks may sit in the future; the dialog clamps to that bound.
- Kind switches now settle the anchor in context, so leaving the own range shows the period the URL names.
- Touches stats.tsx useMoves/useStats by one argument; PR 146 edits the same file, so a small merge conflict is possible.
