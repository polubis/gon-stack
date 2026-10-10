# 0041 - parka expense date+time and alphabetical categories

```json
{
  "status": "done"
}
```

Dashboard expenses tile shows date + local time (`shortDateTimeLabel`, user time zone). Date sort is by timestamp only (`Date.parse`, ties keep order). Categories sorted alphabetically by displayed label (`pl` collator) via `useSortedCategories` in the facades of categories, dashboard, data-export, expenses-management, reports, so listing and every picker share one order. Expense form default category is now the first alphabetical one; one test adjusted.

Verified: vitest (257 pass), eslint, astro check.

Reason: deterministic, simple default ordering, no extra sort mechanism.
