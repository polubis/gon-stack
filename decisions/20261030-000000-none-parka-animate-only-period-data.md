---
ticket: none
scope: parka
summary: Animate only the data on period change
why: Filters and surrounding view must stay static when the period switches
date: 2026-10-30
tags: [animation, period, swipe]
---

- `usePeriodSwipe` returns `contentRef`; slide-in/drag move only that element, handlers stay on `<main>`
- Time and dashboard: data wrapped in `contentRef` div below the filters
  - Dashboard: grid moved into that wrapper (row starts shifted by one), overlays rendered outside it
- Videos: before (filters + data fade together), after (data only)
