---
ticket: VYB-1035
scope: parka/time
summary: Persist time and knowledge filters, plain drawer header
why: Filters should survive leaving the view and a reload; black hero header in the drawer was unneeded.
date: 2026-11-25
---

- Filters of tasks and knowledge saved in localStorage per module (shared/filter-memory), same param format as URL
- URL params win; with none, remembered ones restore. Knowledge catalog param alone does not count as filters
- Account switch clears remembered filters in reconcileDevice
- Drawer header lost hero-card dark background, uses plain text colors
- Tests added for both modules; unit setup now clears localStorage between tests
