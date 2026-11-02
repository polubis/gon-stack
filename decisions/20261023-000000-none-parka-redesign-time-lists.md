---
ticket: none
scope: parka/time
summary: Minimalist redesign of Time views and task rows
why: Rows and views were overloaded with badges and buttons and broke on narrow screens
date: 2026-10-23
tags: [parka, time, ui, rwd, a11y]
---

- Task row: done toggle, title, one muted meta line (time, category, "W trakcie", repeat icon, priority arrow), "more" button
  - No border box; hover and current-time tint only
  - "More" popover (menu, keyboard nav): Szczegóły, Rozpocznij/Wstrzymaj, device; replaces info and play buttons and device badge
  - Recurring mark is a bare icon in rows, labelled pill stays in the edit dialog
- Day: one centered card, "Bez godziny" subsection only when both groups exist
- Week: light per-day cards for all widths below 2xl (1 / 2 / 3 / 4 columns), hour grid from 2xl
- Month: add-day button hidden below md, dots capped at 4 with "+N", softer cells
- Skeleton mirrors the new day card
- Tests and e2e use the more menu for details, start and device
