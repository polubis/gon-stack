# 0002 - one expense form for add and edit, edit on its own route

```json
{
  "status": "done"
}
```

Add and edit share one form, like categories. New `shared/expense-form` (form, product card, products domain, format, e2e ids). `/app/expenses/new/` and new `/app/expenses/edit/?id=<expenseId>&month=<month>` both render it with `layout="page"`; no `id` = create.

- Edit route: loads the expense, saves with PUT, returns to the dashboard of the expense month. Cancel and Back return to the dashboard month. Missing id shows a not-found error.
- Dashboard expense popup is read-only now (amount, category, method, products) with "Edytuj" link to the edit route and "Usun". Popup stack in URL unchanged.
- Form e2e ids renamed `expenses-management:*` -> `expense-form:*`; `dashboard:edit-*`/`dashboard:save` removed, `dashboard:edit` added.
- Tests: unit for edit page + popup, e2e flows/recalculation/backend specs follow the edit route.

Decision: edit save waits for the backend, then navigates (same as create); optimistic UI cannot span two routes without a shared store.
