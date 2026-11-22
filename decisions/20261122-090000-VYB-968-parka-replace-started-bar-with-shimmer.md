---
ticket: VYB-968
scope: parka/time
summary: Replace started bar with random soft shimmer
why: Left bar on started tasks was not liked; a gentle moving gradient like loading skeleton fits better.
date: 2026-11-22
tags: [time, ui]
supersedes: 20261121-123408-VYB-968-parka-add-started-task-marker
---

- Left bar removed; started row gets a soft light gradient sweeping over its background
- Sweep starts after random 4-12 s gap per card (setTimeout in `useShimmer`, cleared in cleanup), cards never pulse together
- `shimmer` keyframes + `--animate-shimmer` token in `index.css`; skeleton has only `animate-pulse`, so gradient keyframes are new
- Overlay is aria-hidden, pointer-events-none, absolute, hidden with motion-reduce, no layout change
- Row keeps `data-started`, gets `data-shimmering` while sweep runs, so tests read state without style details
- Unit tests: fake timers + mocked `Math.random`, shimmer only after the gap on a started task, never on open/done
