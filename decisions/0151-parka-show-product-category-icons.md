---
ticket: none
scope: parka
summary: "Expense popup: product category icons"
why: Products in the popup should show category icons like the main list
date: 2026-10-11
---

- Products in expense popup (`dashboard/presentation/expense-detail.tsx`) reuse `CategoryAvatar` + `categoryOf` like the main list.
- Hierarchy: name (semibold) + total; subtitle `qty x unit price` only when qty > 1.
- No duplicates: product category name shown only for mixed-category expenses; date stays in popup header only.
- Tests: icon without repeated category, category name on mixed expense.
- Proof video: `product-expenses-icons-proof.webm` (repo root, captions in video).
