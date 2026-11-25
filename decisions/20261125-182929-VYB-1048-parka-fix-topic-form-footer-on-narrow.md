---
ticket: VYB-1048
scope: parka/knowledge
summary: Wrap knowledge form footer and day row on narrow screens
why: At 320 px the form footer ran into the modal edge and Do backlogu sat cramped beside the date input, breaking no-overlap UI rule.
date: 2026-11-25
tags: [ux, responsive]
---

- form-footer: footer and action group use flex-wrap, Usuń/Anuluj/Zapisz never leave the modal at 320 px
- topic-dialog: day row wraps, date input min-w-0 flex-1, Do backlogu drops under it when no room
- tests: layout-only change, jsdom has no layout, proof is geometry log in recording
- evidence: video per supported viewport 320-1920
