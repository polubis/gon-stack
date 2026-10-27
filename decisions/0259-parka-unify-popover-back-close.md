---
ticket: VYB-191
scope: parka/ui
summary: Every popover, menu and select closes on mobile Back
why: Only selects closed on system Back; menus and period popovers used local state, so Back left the screen instead
date: 2026-10-27
tags: [parka, ux, popover]
---

- `useSelectOpen` renamed `usePopoverOpen`: one hook for all popovers, menus and selects
  - Narrow screens keep open state in URL modal stack (Back closes only topmost)
  - Wide screens keep it local
- Migrated ad-hoc `useState` popovers: dashboard/time `AddMenu`, `ExpenseMenu`, `TaskMenu`, `PeriodControl` (value + kind)
- Keys stable per instance (`task-menu:<id>`, `add-menu:<side>`)
- Tests: `popover-back.test.tsx` in `shared/ui` and `modules/time` (Back closes, URL cleanup, desktop untouched, two AddMenus independent)
