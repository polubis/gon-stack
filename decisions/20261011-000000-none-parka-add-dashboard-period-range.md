---
ticket: none
scope: parka
summary: "Parka dashboard period: range box, picker, own range, scaled limits"
why: One simple control instead of pills + picker, plus free from-to range
date: 2026-10-11
---

- `period-control.tsx`: preset pills replaced by `‹ [period 3/4 | range icon 1/4] ›`.
- Period click opens the picker of its kind (list of weeks/months/years, date field for day, never future).
- Icon lists kinds: day, week, month (default), year, own.
- Own range: `Od`/`Do` date fields + `Zastosuj`, end before start refused, future cut to today, steps by its own length;
  - plumbed through `shared/period` (`customPeriod`, `resolvePeriod`, `bucketOf(period)`), API (`kind=custom&from&to`) and URL (`?range=custom&from&to`).
- UI polish: narrower centered bar, outline never clipped, no layout jump (list centers inside itself, page never scrolls), arrow/Home/End keys in lists, long labels wrap on 320px.
- `PERIOD_PRESETS`/`presetOf` replaced by `PERIOD_KIND_LABELS`; "Poprzedni rok" preset dropped (year + back arrow).
- Unit + e2e updated.
- Limits scale to the period (day share of each month's limit); period kept in URL, forward stops at the present.
