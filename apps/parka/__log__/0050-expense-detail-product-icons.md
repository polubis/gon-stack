# 0050 - Expense popup: product category icons

```json
{
  "status": "done"
}
```

- Products in expense popup (`dashboard/presentation/expense-detail.tsx`) reuse `CategoryAvatar` + `categoryOf` like the main list.
- Hierarchy: name (semibold) + total; subtitle `qty x unit price` only when qty > 1.
- No duplicates: product category name shown only for mixed-category expenses; date stays in popup header only.
- Tests: icon without repeated category, category name on mixed expense.
- Proof video: `product-expenses-icons-proof.webm` (repo root, captions in video).
