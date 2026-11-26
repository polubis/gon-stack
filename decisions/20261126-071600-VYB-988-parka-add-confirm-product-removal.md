---
ticket: VYB-988
scope: parka/expense-form
summary: Add remove confirmation for expense form products
why: UX rule 7 says delete goes via confirmation, but Usuń produkt removed the product instantly.
date: 2026-11-26
tags: [ux, expense-form]
---

- audit: text inputs already clearable and metadata managed; product removal was the unconfirmed delete found
- new `RemoveProductDialog` stacked in URL modal stack (`remove-product:<id>`) over the product popup
- confirm closes both modals then drops the product; cancel or Escape keeps it
- shared by expense create, edit and both recurring forms through `ProductsSection`
- chose local dialog over dashboard `ConfirmDeleteDialog` to avoid shared importing from a module
- tests: unit updated plus cancel case, e2e confirm and cancel flow
- evidence: recordings at 8 viewports 320-1920, mocked backend, dist via wrangler dev
