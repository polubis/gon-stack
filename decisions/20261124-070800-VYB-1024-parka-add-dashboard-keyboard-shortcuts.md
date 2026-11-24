---
ticket: VYB-1024
scope: parka/dashboard
summary: Add desktop N and C shortcuts for new expense on dashboard
why: Main flows reachable from keyboard without colliding with typing or open dialogs.
date: 2026-11-24
---

- Shared `useShortcut` hook in `shared/keyboard`: window keydown, single key, no modifiers.
  - Silent in input, textarea, select, contenteditable.
  - Silent when any dialog, alertdialog, menu or listbox is open.
- Dashboard: N = new expense, C = new recurring expense.
- Add menu items show kbd hint plus title and aria-keyshortcuts; trigger title lists both keys.
- Hint hidden below md, shortcuts only matter with physical keyboard.
- Scope kept to dashboard (expenses); time module not touched.
