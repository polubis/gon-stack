---
ticket: VYB-248
scope: parka/time
summary: Open-only filter row sits flush left on wide screens
why: On md+ the row stretched label and switch to opposite edges; dev wants it at the list left edge
date: 2026-11-12
---

- `screen.tsx` filter row uses `md:justify-start md:px-0`; mobile layout unchanged.
- Added e2e step checking row x matches list x and the switch sits next to the label at 1280 width.
- jsdom has no layout, so geometry is covered only in e2e (not run here, needs Supabase).
