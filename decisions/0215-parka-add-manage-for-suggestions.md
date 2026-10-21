---
ticket: none
scope: parka
summary: Suggestion lists get a Zarządzaj button for rename and delete
why: Remembered values could not be fixed or removed once typed
date: 2026-10-21
tags: [parka, finance, form-memory, modal-stack]
---

- Typeahead list (payment method, shop) ends with a "Zarządzaj" button
- Stacked URL modals: `manage-suggestions:<field>`, delete confirm `delete-suggestion:<field>:<value>`
  - Rows: rename inline (duplicate name refused), delete via confirmation
  - Skeleton, empty state, optimistic update, success and error toasts
- API `PUT`/`DELETE /api/suggestions/` (rename keeps use count; taken name = 409; no migration)
- Past expenses keep their text; only remembered suggestions change
- Tests: manage flow (jsdom), contracts; fake backends extended
