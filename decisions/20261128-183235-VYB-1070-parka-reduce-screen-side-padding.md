---
ticket: VYB-1070
scope: parka/layout
summary: Reduce screen side padding with one gutter token
why: Side padding grew to 4rem plus per breakpoint and looked odd on wide screens, with the same numbers copied in every module.
date: 2026-11-28
---

- Cause: every module main repeated px-4 md:px-8 lg:px-10 xl:px-16, header wrapper stacked its own md/lg/xl padding
- Fix: token --gutter-x in index.css (1rem, 1.25rem from md, 1.5rem from xl), utilities px-gutter and px-gutter-inset
- px-gutter-inset is gutter minus the 1rem ScreenHeader pads itself, so header and content stay aligned
- Applied to all app modules, public layout, home, sign-in and sign-up
- Modal padding (VYB-1055) and nav (VYB-1057) untouched
- Test: screen-gutter e2e checks padding cap and header alignment at 390, 768, 1280, 1920
