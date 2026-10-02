# 0007 - recurring expenses merged into dashboard, counted live

```json
{
  "status": "done"
}
```

`modules/recurring` deleted; all its code lives in `modules/dashboard` (one store/bus/facade, no cross-module imports). `/app/recurring/` page, nav tab, settings link and "Cykliczne" quick action are gone.

- `RecurringCard` (`xl` top row: Limits | Goals | Recurring): add, edit (pencil), delete (in sheet), pause toggle. Optimistic, toast, rollback. No filters. Own load (`[TRIGGER]_LOAD_RECURRING`), so its failure never hides the rest.
- Real-time counting, no cron: `shared/recurring/occurrences.ts` derives each active item's charge per month (first payment = earliest of `nextPaymentDate`/history, same day monthly, clamped to month length). Nothing stored.
  - Server `get-dashboard` adds those charges to expenses -> total, change, daily chart, categories, KPIs.
  - Client `withRecurring` adds them (source `recurring`) for total/category limit progress and the month list; rows are not buttons (no detail).
- Recurring create/update/delete re-asks the summary (`refreshSummary`, month kept in `$month`).
- `LimitsSheet`/`useSheet` now `shared/ui/sheet.tsx`, `shared/ui/use-sheet.ts`.
- Known: pausing an item removes it from past months too (no pause history).
