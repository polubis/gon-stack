---
ticket: VYB-977
scope: parka/dashboard
summary: Group expenses list by day with day totals
why: Proposal variant 1 makes the month list scannable; date moves to the day heading so rows stay lean.
date: 2026-11-22
tags: [ui, dashboard]
---

- list renders a heading per local day (Dzisiaj, Wczoraj, weekday + date) with the day total on the right
- row shows avatar with recurring mark, merchant, category name below, red outflow amount, More menu
- removed time and hover category tooltip (duplicated info), removed row side padding
- day totals come from the whole filtered list, so the 6-row card stays correct
- list box height now fits 6 rows and 3 headings
- stacked on VYB-930 commit (ExpenseMenu `scope` kept, unchanged)
- tests: unit for headings, totals and row content, format helpers; dashboard e2e still green
