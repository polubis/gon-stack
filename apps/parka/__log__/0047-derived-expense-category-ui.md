# 0047 - Expense category derived from products (UI)

```json
{
  "status": "done"
}
```

UI follows derived category. Mixed products show "Wiele kategorii".

- form/detail: category field read-only when products exist; amount read-only in detail.
- dashboard: category limits, list tabs and filter split by product share.
- reports/export: "Wiele kategorii" label, category count from all touched categories.
- tests: form integration, selectors, mixed-product e2e. Docs: expenses + categories requirements.

Reason: show the derived category consistently.
