---
ticket: none
scope: parka/ui
summary: Clear button on text inputs
why: users need a one-tap way to empty a text field, with focus kept on it
date: 2026-10-11
tags: [ux, forms, a11y]
---

- Added ux rule 14: every text input (text/email/password/search/tel/url) has a clear "x" button that refocuses it
  - Not on select, number or date controls
- New `shared/ui/clearable` with `ClearableInput`, reused by all text fields
  - Clears through the native setter, so existing `onChange` handlers keep working
  - Shown only when a value is present; not on read-only or disabled inputs
  - Fixed right padding, so no overlap with text and no layout jump
  - `leading` slot keeps icons (category icon, search) inside the field
- `Field` uses `label[for]` so the button never pollutes the field name; plain `Input`/`Select` in `controls` pick up the id
- Black-box tests in `shared/ui/__tests__/clearable.test.tsx`
