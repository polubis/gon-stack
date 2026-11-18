---
ticket: VYB-951
scope: parka/ui
summary: Tuck modal scrollbar behind the rounded border
why: Scrollbar thumb stuck out past the 4xl corner radius of scrolling modals, a visible glitch.
date: 2026-11-18
---

- Added `scroll-in-radius` utility in `core/style/index.css`: scrollbar track margin-block 1.5rem, transparent track.
- Applied to all `rounded-4xl overflow-y-auto` modals, drawers and banner in parka.
- Chose one shared utility over per-modal CSS, so new modals reuse it.
- Pulled-in track only affects webkit scrollbars; overlay scrollbars need no fix.
- E2E checks computed track margin on phone and desktop viewports.
