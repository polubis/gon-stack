# 0044 - Dashboard skeleton matches loaded layout

```json
{
  "status": "done"
}
```

Content jumped when the dashboard finished loading. Measured card boxes (320-1440 wide, skeleton vs loaded) with a temporary Playwright script, then aligned the skeleton.

- Removed a stale extra placeholder card (added ~450px of height that vanished on load).
- Hero: stats row + change line; chart: legend row, axis labels row; categories: header with button + donut and legend; expenses: header button, filter chips row, row paddings.
- Greeting skeleton `lg:h-9` (3xl line height).
- After: sections match to the pixel at 390/768/1280/1440 with 3 categories. Heights that depend on data stay approximate: categories legend rows on mobile (3 placeholder rows), filter chips row (shown only with 2+ categories), change line (hidden when change is 0).

Decision: mirror the typical loaded state rather than fixing real heights.

Reason: ux rule 6 - no jumping UI.
