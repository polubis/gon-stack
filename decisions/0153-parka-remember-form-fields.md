---
ticket: none
scope: parka
summary: Parka generic form-field memory
why: Save time re-typing the same values
date: 2026-10-11
---

- New `shared/form-memory`: `useRememberedField({ key, enabled, options, accept })` returns `recalled` (once on mount) and `remember(value)`; values live in one localStorage object (`parka:form-memory`).
- Missing / corrupt / wrong-shape data reads as nothing; storage errors are swallowed; empty/blank value forgets.
- Storage trims on write and read.
- `options` resolves the stored value case-/trim-insensitively to the list's canonical spelling (no match = not recalled); `accept` gets the resolved trimmed value.
- Any field opts in with a key; `accept` rejects stale values.
- Expense form: shop (merchant) + payment method + category opt in; category id resolved via `options`.
- `prefill` prop is set only by the add route, never by edit; scan draft values win (shop included).
- Remembered category not in the list is ignored, so the field keeps its default.
- Category is remembered only without products.
- Tests: hook unit, add/edit form integration (prefill, trimmed shop, case-variant memory, deleted category, corrupt memory, empty forgets, no prefill on edit), desktop e2e (shop trimmed, method, category, stale category).
- Hook unit adds trim, blank, case-insensitive resolve.
- Existing add-form test clears storage for isolation.
