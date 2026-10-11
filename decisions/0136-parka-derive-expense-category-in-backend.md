---
ticket: none
scope: parka
summary: Expense category derived from products (data + API)
why: Category of expense and its products diverged
date: 2026-10-10
---

- Expense with products takes category from them.
- Same/one -> that category.
- Different -> `null`.
- shared: `expense-category/category.ts` (`deriveExpenseCategory`, `categoryShares`) + tests.
- db: `expenses.category_id` nullable, backfill from items.
- api: `expense.categoryId` nullable; create/update derive server-side, 400 when no items and no category.
- dashboard: summary loads `receipt_items`; category breakdown split by product share.
