---
ticket: none
scope: parka/dashboard
summary: Tiles ordered by priority
why: Total + budget status answer "am I OK?" first; expenses are the main task; categories and trend are analysis, so last
date: 2026-10-11
---

- Order (mobile, DOM): hero -> limits -> expenses -> categories -> spending chart.
- From `xl`: row 2 hero | categories, row 3 expenses (8) | limits (4), row 4 chart (12). Explicit `xl:col-start`/`xl:row-start`.
- `DashboardSkeleton` mirrors the same order.
- Limits were last on mobile (below the fold) - moved up.
