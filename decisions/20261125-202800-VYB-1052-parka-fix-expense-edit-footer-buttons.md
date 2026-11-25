---
ticket: VYB-1052
scope: parka/expenses-management
summary: Fix expense edit footer so buttons sit in one right-aligned row
why: Cancel and save wrapped onto two rows with save left, breaking the shared sticky footer alignment (UX rule 14).
date: 2026-11-25
tags: [expenses, ux]
---

- cause: `ExpenseForm` footer was `flex-wrap` with cancel and save as separate flex items, so save dropped to its own row on phones
- fix: cancel and save grouped in one `ml-auto` flex wrapper, total uses `grow`; group wraps as a whole, stays right-aligned
- footer stays the one shared `ModalFooter`, no per-modal copy
- test: e2e `edit-footer.spec.ts` checks sticky bottom while scrolling, one row, save flush right
