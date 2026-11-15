---
ticket: VYB-920
scope: parka/ui
summary: Fix touch scroll trapped in icon list inside mobile full picker
why: Icon grid kept its own max-height scroller inside the full-screen picker scroller, so phone scroll got stuck in a small box with blank space below.
date: 2026-11-15
tags: [parka, mobile, scroll]
---

- Cause: icon grids (categories, time) had `max-h-60 overflow-y-auto`, nested in PickerScreen body that already scrolls
- Fix: grids carry `data-nested-scroll`; PickerScreen body drops max-height and overflow for them, desktop popover keeps the box
- Kept the cap in the grid itself: desktop popover has no height limit of its own
- Test: e2e on 390x844 asserts one scroll container above an icon in the picker (2 before, 1 after)
- Evidence: before and after video on phone viewport, scroll gesture via touch
