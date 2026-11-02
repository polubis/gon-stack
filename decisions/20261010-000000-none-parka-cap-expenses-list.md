---
ticket: none
scope: parka/dashboard
summary: Expenses list capped at 6 + show all
why: A long list stretched the tile; same cap pattern as the categories legend
date: 2026-10-10
---

- List box fixed at 6 rows (`EXPENSES_LIST_HEIGHT`); no inner scroll.
- More rows -> `ShowAllFade` (shared with categories legend) opens `dashboard:expenses-dialog` with full filtered list.
- Row click in dialog closes it, opens edit popup.
- Skeleton list: 6 rows, same box and `pr-2`. Tile never changes height.
