# 0005 - e2e follows the unified expense popup

```json
{
  "status": "done"
}
```

- `flows`, `backend`, `dashboard-recalculation` specs: no `dashboard:edit` step (popup is editable at once); add flow opens `dashboard:expense-new` and picks the "Cykliczny" tab; recurring rows are opened by name.
- Dropped the recurring pause/toggle steps and the `dashboard:recurring` screen root (card removed).
- New `a new normal expense is added to the month total` test through the add popup.

## Decisions

- Tabs are selected by role/name (`Segmented` has no e2e id).
