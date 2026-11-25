---
ticket: VYB-1042
scope: parka/time
summary: Remove duplicate preview badge from priority form
why: UX rule 9 forbids showing the same info twice; the preview repeated the name field and the value picker.
date: 2026-11-25
tags: [time, ux]
---

- priority form: dropped "Tak będzie wyglądać" preview badge, name field and 1-10 picker already show it
- tier meaning (8-10 high, 4-7 medium, 1-3 low) stays in the dialog description
- tests: unit checks the form shows the priority once
- evidence: before/after video through 8 viewports 320..1920 on built app with real backend
