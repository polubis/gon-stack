# 0005 - dashboard redesign (desktop-5)

```json
{
  "status": "done"
}
```

Dashboard rebuilt per `docs/designs/desktop/desktop-5.png`. Header: greeting, month select, add-receipt. 4 KPIs. Daily spending chart vs previous month. Category donut (top 5 + "Inne", other slice found by `isOther` flag, not label). Month comparison. Quick actions. `month-expenses.tsx`: all expenses of selected month, category filter chips (`aria-pressed`, counts, biggest spend first, "Wszystkie" resets, falls back to all when category absent). Detail dialog + toast live in `main`. No modal. Multi-column grid from `xl`; below it cards stack. Chart table in `div.sr-only`. App shell `h-dvh`, sidebar full height, content scrolls inside; bottom nav pinned on mobile (all `/app/*`).

Load failure with no summary: ErrorState only, summary cards hidden (no endless skeletons). Skeletons match real heights.

Backend `/api/dashboard` (query: `month` only): adds `userName`, `transactions`, `dailyAverage`, `daily`, `previousDaily`, `monthlyLimit`; categories scoped to selected month. Fetches selected + previous month.

Removed: range picker, prev/next buttons, "Największe zmiany", expenses modal, recent list, bills filter, `expenses.tsx`, `expenses-skeleton.tsx`, `layout.tsx`, `rangeTotal`, `trend`, `categoryChanges`, `trendMonths`, `nextMonth`.

e2e ids: `month-select`, `transactions`, `daily-average`, `limit-left`, `expenses`, `filter:*`, `previous-total`. Dropped: `prev-month`, `next-month`, `month-label`, `range-total`, `changes`, `recent`, `show-all`.

Tokens: `--z-tooltip` for chart tooltip.

Reason: match new desktop design; one month-centric home view.
