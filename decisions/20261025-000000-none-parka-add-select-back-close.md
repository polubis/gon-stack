---
ticket: none
scope: parka/ui
summary: Back button closes an open select on mobile
why: On phones Back left the screen while a select was open instead of closing just the select
date: 2026-10-25
tags: [parka, ux, select]
---

- New `useSelectOpen(key)` in `shared/ui/use-select-open.ts` holds the open state of a select
  - below `sm` (`max-width: 39.99rem`) it lives in the URL modal stack as `select:<key>`
  - wider screens keep local state and never touch history
- Narrow open pushes one history entry through `openModal`
  - Back closes only the select and keeps the screen
  - Esc, choosing an option and a click outside go through `closeModal`, so no double Back
  - reload or deep link restores the open select (stable key: `data-e2e` or label)
- `SelectPopover` and `Select` (Radix) use the hook; look stays the same dropdown on every width
  - full screen panel was tried and dropped
  - Radix keeps the focus trap, `aria` and focus return to the trigger
- `routes.ts` and `modal-stack.ts` are untouched
- New e2e `categories/__e2e__/select-back.spec.ts`: narrow Back, outside click, Esc, choice, reload and wide dropdown
  - e2e `recurring expenses can be added and removed` now fixes the present to the 10th of the month, so it no longer fails in the last week of a month
