# 0025 - merge statistics into home dashboard

```json
{
  "status": "done-with-clarification"
}
```

- `/app/` dashboard now has a range picker (Miesiąc / 3 miesiące / 6 miesięcy / Rok) on top; range is sent to the backend (`GET /api/dashboard/?month&trendMonths`), kept in `?range=`.
- Backend `summarizeDashboard` returns `previousTotal`, `rangeTotal`, range-scoped `categories` (donut) and `categoryChanges`; fetch window always covers >= 2 months. Default range 6 (was 8 fixed).
- Donut and month comparison (current vs previous, biggest changes) always rendered; `load` keeps `$data` on reload.
- Removed `modules/statistics`, `/app/statistics/` page, `APP_ROUTER.statistics`, `stats` nav tab, statistics e2e ids/specs. e2e moved to `dashboard:*` ids.

Why: statistics and dashboard duplicated views and logic. Clarification: "budżety" read as the range buttons that drive backend filtering.
