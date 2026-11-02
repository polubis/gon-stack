---
ticket: none
scope: parka/time
summary: Show priority as marker and color only in list rows
why: Priority name in list rows is noise; marker and tone suffice, name belongs in forms and details
date: 2026-10-27
tags: [parka, time, priority, a11y]
---

- `PriorityBadge` gets `compact` prop
  - Pips and tone stay; name becomes `sr-only`, so screen readers still hear `Priorytet: Wysoki, 9 z 10`
- `TaskRow` (day, week, month, backlog lists) uses `compact`
- Task details and priority dialog preview keep the full badge with name; picker unchanged
- Test: compact badge keeps the name announced but visually hidden
