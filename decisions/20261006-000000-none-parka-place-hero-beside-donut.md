---
ticket: none
scope: parka/dashboard
summary: "Desktop summary row: hero + donut side by side"
why: Wide screens had a lot of empty space beside the hero; donut belongs next to the totals
date: 2026-10-06
---

- From `xl`: `TotalHero` (col 1-6) and `CategoriesCard` donut (col 7-12) share row 2 at equal width; `SpendingChart` takes full width on row 3. Placed via `xl:col-start`/`xl:row-start`, DOM order unchanged, so below `xl` layout is as before.
- `TotalHero` stretches to the donut card height (`xl:h-full`, content centered).
- `Donut`: legend beside the ring from `sm` up (dropped `xl:flex-col` / `2xl:flex-row` / `xl:h-36`).
- `LimitsCard` matches `MonthExpenses` height from `xl` (`xl:h-0 xl:min-h-full`); inner list scrolls, card never grows the row. Below `xl` keeps fixed height.
- "Dodaj kategorię" button: label `truncate` (ellipsis), icon `shrink-0`.
- `DashboardSkeleton` mirrors all of the above.
- Hero and donut stay separate cards instead of one panel: no duplicated donut markup.
