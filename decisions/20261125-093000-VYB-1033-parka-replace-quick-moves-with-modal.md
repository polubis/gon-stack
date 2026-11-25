---
ticket: VYB-1033
scope: parka/time
summary: One Przenieś menu item opens a day, week, month choice modal
why: Menu offered only tomorrow and next week plus a date input; dev wants day, week, month in both directions and a custom day, chosen like the recurring scope.
date: 2026-11-25
tags: [time, ux]
---

- menu: one `Przenieś` item opens stacked modal `task-move:<id>`, quick items and inline date input removed
- modal: seven radios (next/previous day, week, month, custom day) in the look of the recurring scope dialog, each shows its target date, custom shows a date input
- target: counted from the task day, from today for a backlog task; weeks land on Monday (as the old next week), months keep day of month and clamp in short months
- dropped the `dziś` quick move: custom day covers it
- tests: domain unit for targets, flow tests for every choice, custom day, cancel, backlog; e2e specs updated
- evidence: webm of the flow on real local backend
