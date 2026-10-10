# 0043 - parka expenses tile capped at 6 + show all

```json
{
  "status": "done"
}
```

Expenses tile shows 6 rows in fixed box (`EXPENSES_LIST_HEIGHT`); more -> `Pokaż wszystkie` over fade opens dialog (`dashboard:expenses-dialog`) with full filtered list. Row click in dialog closes it and opens edit popup. Fade button extracted to `ShowAllFade`, shared with categories legend. Skeleton list mirrors it (6 rows, same box, `pr-2`). Skeleton vs loaded card boxes identical, CLS 0 (playwright, delayed API). Tests: flow test for 8 expenses + no button for <=6. Verified: vitest 259 pass, eslint, astro check.

Reason: same pattern as categories legend, no height jumps.
