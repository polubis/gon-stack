---
ticket: none
scope: parka
summary: Polish finance dashboard layout, empty states and chart legibility
why: Critical UX/UI review found weak hierarchy, duplicated CTAs, dead space and tiny chart text
date: 2026-10-13
tags: [dashboard, ux, ui]
---

- Order on mobile: hero, expenses, categories, limits, chart; skeleton mirrors it; main gap `gap-3 md:gap-4` (was `gap-4 md:gap-6`)
- Header: removed emoji and redundant subtitle; single "Dodaj wydatek" button (card duplicate removed, `dashboard:expense-new` moved to header)
- Limits: shorter label (no period repeat), category-limits empty state fills the fixed-height card with icon and hint
- Limits redesign (single form) tried and reverted on dev request; original limits flow kept
- Categories donut: legend height capped only when it overflows, no dead space
- Chart: axis text 12px (was 10px), no baseline slivers for zero days, `gap-px` token instead of arbitrary value
- Checks: eslint clean, vitest green
