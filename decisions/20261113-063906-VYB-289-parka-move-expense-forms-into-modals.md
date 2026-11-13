---
ticket: VYB-289
scope: parka/expenses-management
summary: Expense forms open in a modal, product edit in a stacked modal
why: Forms had a sticky bottom bar and receipt upload links, and products were edited inline; the dev wanted modals with a static footer and no upload links.
date: 2026-11-13
tags: [parka, expenses, modal, forms]
---

- New and edit routes (normal and recurring) render their form inside a Radix dialog; closing leaves for the dashboard
- Footer of both forms is static (no sticky, no floating card), at the end of the modal content
- Receipt upload and camera buttons removed from the forms; the "Dodaj" menu still hands a photo over and the page scans it on arrival
- Product edit moved to its own popup (`product:<id>` in the URL modal stack) over the form; rows show a summary and a "Gotowe" button closes the popup
- Dropped the `layout` page/dialog variants and the `openId` accordion state, now one layout
- Page behind the modal stays empty: the dashboard and the form use separate contexts, so showing the dashboard under the popup was left out
- Product popup state lives in the URL, so a reload keeps a stale id that renders nothing
- Evidence: mock backend video and screenshots; binary upload to the ticket was blocked (see the ticket comment)
