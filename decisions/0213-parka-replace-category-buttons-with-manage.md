---
ticket: none
scope: parka
summary: Categories card gets one Zarządzaj button opening the list modal
why: Two header buttons on the card were redundant; the list modal already has Dodaj
date: 2026-10-21
tags: [parka, finance, categories, modal-stack]
---

- Categories card header: "Kategorie" and "Dodaj" buttons replaced by a single "Zarządzaj" button
  - Opens the categories list modal; its "Dodaj" stacks the new category modal over it (URL-stacked)
  - Empty state keeps its "Dodaj kategorię" action
- Card title "Kategorie wydatków" renamed to "Kategorie" (also dialog title)
- Unit tests updated for the new label and flow
- Categories flow micro-effects aligned with the time module
  - Categories list rows and card legend rows: `animate-item-in` with capped stagger, `motion-reduce:animate-none`
  - Row links: `transition-colors`, hover and focus-visible ring tokens
  - `DetailDialog` (card "show all" dialog): `animate-pop-in`, popover shadow, close button hover/focus ring
  - Shared `Button`: focus-visible ring (`ring-brand`)
  - Category modal close button gets `transition-colors`; the modals already used `animate-pop-in`
