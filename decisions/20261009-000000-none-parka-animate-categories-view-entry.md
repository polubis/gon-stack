---
ticket: none
scope: parka
summary: "Categories: animated view entry"
why: Smooth navigation; respects reduced-motion (ui rule 3)
date: 2026-10-09
---

- `core/style/index.css`: `--animate-view-enter` (0.3s fade + 0.5rem slide) -> `animate-view-enter` utility.
- `categories/presentation/shell.tsx`: outlet (and load-error) wrapped in a div keyed by pathname, so list, new and edit each animate on entry. `motion-reduce:animate-none`.
- Scope: categories only; other modules untouched for now.
- Decision: new rule `ux.md` #10 - whole-view entry animated.
- One wrapper in the layout route instead of per-view classes.
