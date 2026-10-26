---
ticket: none
scope: parka
summary: Unpin expense save bar, shrink star and menu, hide mobile nav
why: Sticky bar and oversized star/menu wrapped content; open overlays need the whole screen
date: 2026-10-26
tags: [expense-form, typeahead, ui, navigation]
---

- Expense form save bar no longer sticky, spacing unchanged
- Typeahead star button, icon, menu rows and manage button made compact
  - Clearable input trailing slot padding reduced to match
- Mobile bottom nav hides while any dialog, popover, select list or menu is open
  - `OverlayNav` context in app shell counts open Radix overlays, so stacked ones keep nav hidden until the last closes
  - `NavSlot` slides bottom nav away and back, inert while hidden, no motion under `motion-reduce`
  - Desktop side nav untouched; account menu opts out with `data-keeps-nav`
- Tests: save bar not pinned, long typeahead value truncates, bottom nav hidden for select/dialog/stacked dialogs, side nav never hidden
