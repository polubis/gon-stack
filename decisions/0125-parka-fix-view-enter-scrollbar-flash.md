---
ticket: none
scope: parka
summary: "View entry: scrollbar flashing on mount"
why: A positive `translateY` counted as scrollable overflow and flashed the scrollbar; sliding from above adds none
date: 2026-10-09
---

- Scrollbar appeared and vanished while categories views mounted.
- Cause: `view-enter` started at `translateY(+0.5rem)`; transforms count as scrollable overflow, so the shifted view extended the page bottom for 0.3s -> scrollbar in, then out.
- Fix: `core/style/index.css` keyframe starts at `translateY(-0.5rem)`. Negative offset (above the top) adds no scrollable overflow. No clipping wrapper, so focus rings stay intact.
- Not verified in a browser (only types/lint/tests/build). Cause inferred from layout rules.
- Decision: slide from above instead of `overflow-clip` on the wrapper.
