---
ticket: VYB-1032
scope: parka/time
summary: Flat task lists grouped per category, recurring in own tile
why: Task rows had needless side padding; lists should look like the expenses list and split per category.
date: 2026-11-25
---

- Backlog dialog and day view use new `TaskGroups`: category heading, then flush rows divided by lines
  - `TaskRow` got `flat` prop; week view keeps old padded rows
  - Category dropped from the row meta when flat: heading already shows it
- Day view: two tiles, regular and recurring, each grouped per category
  - Hour split and the "now" line removed; current-time task still gets `aria-current`
- `groupByCategory` in domain: category order, row order kept, unknown categories last
- Tests: domain grouping, day tiles, backlog groups; e2e ids added
