---
ticket: none
scope: parka
summary: Finance gets the time add menu and animated category modals
why: Finance and tasks must look and behave the same; categories were separate pages
date: 2026-10-21
tags: [parka, finance, categories, modal-stack, add-menu]
---

- Finance "Dodaj" button and mobile FAB open a popover: Wydatek, Wydatek cykliczny, Kategoria
  - Same look, animation and keyboard navigation as the tasks add menu
  - Expense options link to the new expense page (recurring via `type=recurring`), category opens a modal
- Categories module: new category form and categories list as animated URL-stacked modals
  - Ids `category-new`, `categories-list`; list "Dodaj" stacks the form over it, Back closes only the top one
  - Rendered from the finance screen with own provider, categories fetched only when a popup opens
  - Rows still link to the existing edit page; load error uses the error pattern
- Finance categories card: "Kategorie" opens the list, "Dodaj" opens the form
- Modal shell and add menu copied into finance, not shared: tasks versions are typed to tasks e2e ids and options
- E2e specs open the menu before choosing "Wydatek"; new unit tests for the menu and both modals
