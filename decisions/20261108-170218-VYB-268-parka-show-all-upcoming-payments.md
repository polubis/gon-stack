---
ticket: VYB-268
scope: parka/dashboard
summary: Cap upcoming panel at 3 nearest, list all in a modal
why: Capping the list at 3 hid every other recurring payment with no way to reach it
date: 2026-11-08
---

- `upcomingCharges` takes an optional `limit` and is uncapped by default
  - Popup lookup in `main.tsx` now finds every rule, not only the first 3
- Panel shows the 3 nearest payments of the selected period
- "Pokaż wszystkie" button at the panel bottom, only when more payments exist
- Button opens a modal with the next payment of every rule, near or far
  - URL id `upcoming`: stacks, deep-links, Back closes only it
  - Row opens the rule popup on top
- Panel stays hidden when nothing falls in the selected period (existing behavior kept)
- Tests: selector limit, panel vs modal, stacked popup, e2e `upcoming-all.spec.ts`
- Before/after videos recorded with the e2e spec as evidence for VYB-268
