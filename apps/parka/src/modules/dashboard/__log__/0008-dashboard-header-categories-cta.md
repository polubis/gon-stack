# 0008 - quick actions removed, header + categories CTA tweaks

```json
{
  "status": "done"
}
```

- Quick actions widget deleted (`quick-actions.tsx`, `quick-action-icon.tsx`, `QUICK_ACTIONS`, `QuickAction*` types); duplicated header/KPI links.
- Header button `Dodaj paragon` -> `Dodaj wydatek`; month select and button share `h-11`.
- `CategoriesCard` gets `Dodaj kategorię` link to categories page (`dashboard:category-new`).
- `Comparison` bars swapped: previous month left, current right (chronological).
- Limits | Goals | Recurring cards moved to the bottom of the dashboard (least important).
- Month expenses list fixed height (8 rows, scrolls beyond); skeleton shows 8 rows.
- Comparison card removed; previous month total + trend now in the spending KPI. Expenses list full width.
- Transactions / daily average / limit-left KPIs show the same trend line as spending (arrow, %, previous month value). Summary gains previousTransactions, previousDailyAverage; limit-left trend is derived client-side (higher is better).
- Category donut legend shows amount next to label and percent.
