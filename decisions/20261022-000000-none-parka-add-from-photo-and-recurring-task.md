---
ticket: none
scope: parka
summary: Finance photo/file add items; time recurring task add item
why: Receipt scan and recurring tasks were buried inside forms
date: 2026-10-22
tags: [parka, dashboard, time, receipt-scan, recurring]
---

- Finance add menu: two items, "Ze zdjęcia" (camera capture) and "Z pliku" (image picker); each takes an image, stashes it in `sessionStorage` (`shared/receipt-handoff`), opens new expense page which scans it at once
  - Photo too big for storage: page opens without scan, upload buttons still work
- Time add menu: "Zadanie cykliczne" opens task form with "Powtarzaj" already on (URL modal `task-new-recurring`)
- Tests: menu items and recurring form default
