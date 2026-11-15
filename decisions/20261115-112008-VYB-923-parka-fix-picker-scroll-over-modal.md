---
ticket: VYB-923
scope: parka/ui
summary: Fix picker list scroll when opened over the expense form modal
why: PickerScreen had no Dialog.Overlay, so only the form modal's scroll lock existed and it cancelled wheel and touch scroll inside the picker.
date: 2026-11-15
tags: [parka, mobile, scroll]
---

- Cause: Radix puts the `react-remove-scroll` lock on `Dialog.Overlay`, content is its shard
  - PickerScreen rendered no overlay, so a picker over the form modal sat outside that modal's shard
  - Its wheel and touch events got `preventDefault`: scrollbar visible, list stuck
- Not the VYB-920 cause (nested scroller); that fix stays, PR #117 was already merged so this builds on main
- Fix: transparent full-screen `Dialog.Overlay` in PickerScreen, picker owns its lock and shard
  - Content covers the overlay, no visual change
- Test: e2e on 390x844, 30 categories and 30 payment suggestions, wheel over the list must scroll it
  - Red before the fix, green after
- Evidence: before and after video for both pickers, scrollTop 0 before, 693 and 816 after
- Limit: test and video scroll by wheel, not touch gesture; the same lock cancels both
