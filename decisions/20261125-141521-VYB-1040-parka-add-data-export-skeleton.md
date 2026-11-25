---
ticket: VYB-1040
scope: parka/data-export
summary: Add format skeleton to data export while loading
why: UX rule requires a layout-mimicking skeleton while a module loads, export page showed active format cards before data arrived.
date: 2026-11-25
tags: [data-export, ux]
---

- `Main` renders a `role=status` skeleton (Format label + two format cards) while `initializing`, real radios replace it after load, same grid so no jump
- new e2e id `data-export:skeleton`
- unit test covers placeholder then radios, csv-default test now awaits radios
- evidence: one recording resized through 320-1920 px, `.evidences/VYB-1040`, uncommitted
