---
ticket: none
scope: parka
summary: Add products to recurring expenses on create and edit
why: A recurring rule such as weekly shopping needs its product list, so every charged expense carries it
date: 2026-10-16
---

- New `recurring_items` table (RLS, FKs to rule and category); `recurring_expenses.category_id` nullable
  - `recurring` contract gets `items`; with products cost is their total and category the shared one, else null
- Materialization copies items into `receipt_items` per new expense; editing a rule affects only future occurrences
- Shared `ProductsSection` and `useProducts` extracted from `ExpenseForm`, reused by both recurring forms
  - Cost and category read-only when products exist; dashboard edit dialog and create form both support products
- Create-recurring form reuses `ReceiptUpload` scan: a receipt fills name, payment method and products
  - Edit dialog has no scan (dashboard module lacks the scan pipeline)
- Tests: unit, component, dashboard e2e and real-backend REST e2e
