---
ticket: none
scope: parka/dashboard
summary: Categories legend capped at 6 + show all
why: Many categories stretched the tile; cap the legend at 6 rows and open the rest on demand
date: 2026-10-10
---

- `Dodaj kategorię` button -> `Dodaj`.
- Donut now draws all categories (no folding into `Inne`); `foldSlices`, `MAX_CATEGORY_SLICES`, `OTHER_CATEGORY_*` removed. Sort unchanged.
- Legend shows 6 rows in a fixed-height box (`h-48`); more -> bottom-centered absolute `Pokaż wszystkie` over a fade gradient that opens a dialog (`dashboard:categories-dialog`) with the same donut + full list. Tile never changes height.
- `DashboardSkeleton` legend mirrors it (6 rows, same height).
