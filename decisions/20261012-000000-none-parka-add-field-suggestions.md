---
ticket: none
scope: parka
summary: Per-account typeahead with use counts for shop and payment method
why: Dev wants advanced autocomplete stored per account instead of one localStorage value
date: 2026-10-12
tags: [expense-form, suggestions, supabase]
---

- DB `field_suggestions` (RLS owner): field, value, use_count, last_used; unique per field ignoring case/spaces
  - RPC `record_field_use` (invoker); no favorites
- `/api/suggestions/` GET list, POST record use; Zod in/out
- `Typeahead` combobox (ARIA, arrows/Enter/Esc, clear "x"); list hidden when nothing matches
  - Rank: use count, then recency; blank field auto-filled with top value
  - Small muted non-interactive star inside the field marks a value used 3+ times
  - Save counts one use of shop and payment method
- Shop and payment method memory moved from localStorage to account; category stays in localStorage (select of ids)
  - No offline fallback: non-trivial, form stays usable and blank when load fails
- Tests: rank/frequent domain, typeahead UI, form flow with msw, contracts, dashboard e2e, real-backend REST e2e
