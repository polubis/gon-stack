---
ticket: VYB-208
scope: parka/date
summary: Unify date labels with weekday and month names across parka
why: Numeric dates and bare day numbers were unclear and written differently per screen
date: 2026-11-02
tags: [ux, i18n]
---

- `shared/date/date.ts` gains the one pl-PL labelling set: `dayLabel`, `rangeLabel`, `monthLabel`, `monthNameLabel`, `weekdayLabel`, `weekdayNames`, `instantDayLabel`, `instantDateTimeLabel`
  - Short `pon. 19 paź 2026`, range `pon. 19 – niedz. 25 paź 2026` (shared month/year written once), long `poniedziałek, 19 października 2026`
  - Intl comma after short weekday dropped (`pon., 19` -> `pon. 19`)
- Period control (finance and time) label and picker options: numeric `19.10.2026` -> weekday/month names; month `październik 2026`
- Own-range dialog: weekday headers, day aria-labels, summary use the shared labels
- Time: week day cards `wt. 20 paź`, month header `pon.`..`niedz.`, task details and dialog show full date, quick-move menu shows target date, toast uses `pt. 30 paź`
- Dashboard: period titles, chart axis (week: `pon. 14`), chart tooltip/table (`pointTitle`), expense and recurring dates, notification diffs, comment and token times
- CSV/PDF exports keep numeric dates (data, not UI)
- Native `type=date` inputs unchanged (browser-formatted)
