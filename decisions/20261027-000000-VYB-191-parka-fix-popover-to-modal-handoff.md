---
ticket: VYB-191
scope: parka/ui
summary: Modal opened from a popover action no longer vanishes on mobile
why: Closing a narrow popover steps history Back (async); the modal pushed right after was undone by that Back
date: 2026-10-27
tags: [parka, ux, popover, modal-stack]
---

- Root cause: `setOpen(false)` + `openModal(id)` in one click; Back resolved after the push and popped the new modal
- `replaceModal(from, to)` in modal-stack swaps the popover entry for the modal in place (no history step)
- `usePopoverOpen` exposes `openModal(modal)`: narrow swaps in place, wide closes locally then opens
- Migrated task menu delete, time add menu, dashboard add menu (modal options)
- `replaceUrl` accepts optional state to keep `modalDepth`
- Tests: time `popover-back` unit (delete, add menu, one Back), dashboard `popover-modal` e2e, real-backend time e2e on phone width
