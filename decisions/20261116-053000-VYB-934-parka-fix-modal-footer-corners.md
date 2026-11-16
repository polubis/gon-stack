---
ticket: VYB-934
scope: parka/ui
summary: Round modal footer corners, no square corner poking out
why: Confirm dialogs have no overflow, so the square footer corner stuck out of the round frame corner.
date: 2026-11-16
---

- Cause: 4 confirm dialogs (time, categories, dashboard, access-tokens) have `overflow: visible`, so the square bottom corners of `ModalFooter` painted outside the `rounded-4xl` frame; scrolled frames clipped it
  - Previous check looked at scrolled forms only, wrong sample
- Fix in shared `ModalFooter`: `rounded-b-4xl`, matches the frame radius for every modal with a footer
  - Chosen over `overflow-hidden` on frames: no clipped focus rings or shadows, no per-modal change
- Measured 1280x800, 1440x900, 1920x1080, 1280x480, 390x560 in light and dark: gap under footer 0 px, footer radius 36 px
- Test: confirm dialog ends with its footer, no CSS class asserts
- Earlier VYB-934 note "frame overflow clips corners" was true only for scrolled frames
