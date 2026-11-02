---
ticket: none
scope: parka
summary: Suggestion star is a button inside the input opening the menu
why: Star only marked frequent values and could not be used; menu opened implicitly on focus
date: 2026-10-20
tags: [parka, form-memory, ux]
---

- `Typeahead` (single autosuggest input, used by shop and payment method) shows a star button inside the field
  - Click toggles the suggestions list, focuses the input, `aria-expanded`/`aria-haspopup`
  - Hidden when nothing remembered, disabled or read-only
- List no longer opens on focus; still opens on typing and ArrowDown
- Frequent-value marker removed
- Tests updated for star button, no open on focus, toggle
