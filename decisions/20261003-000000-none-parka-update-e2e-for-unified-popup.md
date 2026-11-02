---
ticket: none
scope: parka/e2e
summary: E2e follows the unified expense popup
why: Add and edit flows changed with the unified expense popup, so specs must follow it
date: 2026-10-03
---

- `flows`, `backend`, `dashboard-recalculation` specs: no `dashboard:edit` step (popup is editable at once); add flow opens `dashboard:expense-new` and picks the "Cykliczny" tab; recurring rows are opened by name.
- Dropped the recurring pause/toggle steps and the `dashboard:recurring` screen root (card removed).
- New `a new normal expense is added to the month total` test through the add popup.
- Tabs are selected by role/name (`Segmented` has no e2e id).
