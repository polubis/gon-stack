---
ticket: VYB-1041
scope: parka/time
summary: Free days in week view get EmptyState card instead of plain text
why: UX rule 16 asks icon:title:description pattern for empty states, week day cards showed bare "Brak zadań." line.
date: 2026-11-25
tags: [time, ux]
---

- week day card: empty day renders `EmptyState` card variant (CalendarPlus icon, "Wolny dzień", hint to use plus)
- no action button inside: header plus already adds task for that day (UX rule 9, no duplicates)
- title differs from period-level "Brak zadań" so headings stay unique on screen
- 2xl hour grid untouched, it has no per-day empty text
- tests: unit for free days in week, real-backend e2e step checks free day empty state
- evidence: video per viewport 320 to 1920 (8 runs, `emptyDays=6` each)
