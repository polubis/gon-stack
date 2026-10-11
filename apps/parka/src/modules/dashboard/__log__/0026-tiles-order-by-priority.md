# 0026 - tiles ordered by priority

```json
{
  "status": "done"
}
```

- Order (mobile, DOM): hero -> limits -> expenses -> categories -> spending chart.
- From `xl`: row 2 hero | categories, row 3 expenses (8) | limits (4), row 4 chart (12). Explicit `xl:col-start`/`xl:row-start`.
- `DashboardSkeleton` mirrors the same order.

## Decisions

- Why: total + budget status answer "am I OK?" first; expenses are the main task; categories and trend are analysis, so last.
- Limits were last on mobile (below the fold) - moved up.
