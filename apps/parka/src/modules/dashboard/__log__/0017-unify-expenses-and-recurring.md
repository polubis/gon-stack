# 0017 - one expenses list, one edit popup

```json
{
  "status": "done"
}
```

- Removed `RecurringCard`; recurring charges are rows of `MonthExpenses` (repeat icon), `Dodaj cykliczny` button in its header. List + limits share the xl row (8/4).
- Every row opens a popup with fields editable at once (`DetailDialog`): `ExpenseDetail` (no view mode, no pencil), `RecurringDetail` (form + payment history, delete).
- Tracking switch removed from UI; `active` stays in data (new items `true`).
- `recurringChargeId` selector maps a derived row to its recurring item.
- e2e/unit specs updated; add popup creates normal expenses too (`[TRIGGER]_CREATE_EXPENSE`), one `RecurringBadge`, confirm buttons right (see app log 0030).

## Decisions

- Recurring item with first payment in a later month has no row until that month (list is month-scoped).
- Pause dropped: delete is the only way to stop a charge.
