---
ticket: VYB-932
scope: parka/time
summary: Show category icon and priority pips in filter chips
why: Filter drawer chips were plain text while categories and priorities elsewhere show color and icon.
date: 2026-11-15
tags: [parka, time, filters, ui]
---

- Category chips show `CategoryIcon` in the category color, like the category picker
- Priority chips show `PriorityMeter` in the level tone, like `PriorityBadge`
  - Pressed chip puts the mark on a `bg-card` pill so it stays readable on brand background
- Marks are `aria-hidden`: accessible chip names unchanged
- Tests: 2 unit tests in `task-filters.test.tsx`
- Evidence: desktop and mobile recordings with stubbed `/api/time/`
- Limit: status, timing and sort chips have no icon or color source, left plain
