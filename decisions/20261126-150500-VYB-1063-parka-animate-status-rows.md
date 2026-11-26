---
ticket: VYB-1063
scope: parka/time
summary: Animate and focus rows in task statuses dialog
why: UX rule 19 wants create/delete transitions on changed items; added status row was instant and unfocused, cramped at 320px.
date: 2026-11-26
tags: [ux, time]
---

- audit: areas hit by recent tasks skipped; statuses dialog rows lacked create/delete transitions (rule 19)
- `useListChanges` with constant signature: rows fade in and out, neighbours glide, typing never flashes
- new row gets focus (`autoFocus` via `focusId`) so the user types at once
- row wraps below 10rem input: name field full width, move and delete buttons on the next line at 320px
- evidence: one webm walks 8 viewports 320-1920 with add, type, delete
