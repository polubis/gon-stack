---
ticket: none
scope: parka/dashboard
summary: pick own date range in a calendar modal
why: two raw date inputs were clumsy; choosing own range should open the picker at once
date: 2026-10-11
tags: [dashboard, period, modal]
---

- Choosing the own range opens a calendar modal to pick from and to days
  - Modal lives in the URL modal stack, Back closes it
  - Days after today are disabled, apply needs both days
  - Period change runs after the modal closed, so Back cannot undo it
- Replaced the two date inputs and their e2e ids
- Added `closeModalThen` to the modal stack
- Tests: unit flow of the modal, e2e pick and Back
- Quick jump: tapping the month title opens month grid + year select/arrows
  - Future months/years disabled, calendar keeps fixed height (no jumping)
  - Focus lands on current month, returns to title on pick; motion-reduce safe
  - Tests: unit jump/year/keyboard/future, e2e jump to June last year
