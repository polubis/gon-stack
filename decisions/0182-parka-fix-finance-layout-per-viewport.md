---
ticket: none
scope: parka
summary: Fix finance dashboard layout across 320-1920 px, light and dark
why: Dev asked for presentation layout fixes at every supported viewport; audit found centering, grid and wrapping bugs
date: 2026-10-14
tags: [dashboard, ui, rwd]
---

- Audit: Playwright at 320/480/640/768/1024/1280/1440/1920, light + dark, mocked backend
- Main content capped at `max-w-7xl` and centered (`mx-auto`) next to the side panel; was stretched at 1440-1920
- xl grid aligned 6/6 on both rows (expenses + limits were 8/4, misaligned with hero + categories); skeleton mirrors it
- Limits card: fixed `md:h-128` left dead space at 768-1023; now `md:h-auto` with min/max height, xl keeps row height
- Category limit rows: amount never splits across lines (`whitespace-nowrap`, wraps under name on narrow cards)
- Chart: legend and header go in a row from `md` (was `xl`); every other x-axis label hidden below `sm` so labels do not touch
- Donut legend: `title` shows full name of truncated category
- Checks: eslint clean, astro check 0 errors, vitest dashboard 129 green
