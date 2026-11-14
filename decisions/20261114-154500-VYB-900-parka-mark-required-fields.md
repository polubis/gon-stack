---
ticket: VYB-900
scope: parka/forms
summary: Red asterisk on labels of required fields, new UX rule in nitpick
why: Forms did not tell which fields are required; required ones get a red asterisk, optional ones none, enforced as a rule.
date: 2026-11-14
tags: [parka, forms, ux, nitpick]
---

- `Field` got a `required` prop: label gets `data-required` and a red asterisk via `after:` pseudo-element, so label text and accessible name stay clean (`getByLabelText('Nazwa')` keeps working)
- Marked required fields in sign-in, sign-up, expense form and product dialog, task/backlog/priority/category dialogs, categories, profile, access token, limit form and both recurring forms
- Category selects are required only when no products derive the category (`required={!hasProducts}`); task time only when not all-day
- Optional fields (end date, payment method, price/qty/discount, token TTL, status) have no mark
- New rule `ux-required-mark` in `.nitpick/config.ts` (ux group), synced to `.claude/rules/ux.md`
- Unit tests `shared/ui/__tests__/field.test.tsx`; full parka vitest 1438 passed, `astro check` and eslint clean
- Proof `.evidences/VYB-900/` (not committed)
