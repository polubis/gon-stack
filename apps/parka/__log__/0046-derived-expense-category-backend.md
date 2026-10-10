# 0046 - Expense category derived from products (data + API)

```json
{
  "status": "done"
}
```

Expense with products takes category from them. Same/one -> that category. Different -> `null`.

- shared: `expense-category/category.ts` (`deriveExpenseCategory`, `categoryShares`) + tests.
- db: `expenses.category_id` nullable, backfill from items.
- api: `expense.categoryId` nullable; create/update derive server-side, 400 when no items and no category.
- dashboard: summary loads `receipt_items`; category breakdown split by product share.

Reason: category of expense and its products diverged.
