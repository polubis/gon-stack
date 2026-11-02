---
ticket: none
scope: parka/dashboard
summary: Subtle recurring mark in expense rows
why: The recurring pill repeated per row, took width and clashed with the category pill
date: 2026-10-10
---

- `RecurringMark`: repeat glyph on avatar corner, sr-only "Cykliczny"
- `month-expenses`: pill beside merchant removed; popup keeps `RecurringBadge`
- Desktop category pill removed; hover/focus tooltip left of amount (`role="tooltip"`), sr-only category in date line
