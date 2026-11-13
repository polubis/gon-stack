---
ticket: VYB-304
scope: parka/navigation
summary: Animate add button with transform when bottom nav hides
why: The floating add button jumped when the bottom nav collapsed, because the layout shifted by the nav height in one step.
date: 2026-11-13
tags: [parka, navigation, animation]
---

- Nav rows now collapse from a 150ms timer in `NavSlot` instead of a CSS transition delay, so the layout shift frame is known
- `NavSlot` sets `data-nav-collapsed` on the root in a layout effect (same commit as the shift) and publishes `--bottom-nav-h`
- New `NavFollow` rail wraps both add buttons (time, dashboard) and glides over the nav height via transform keyframes
- Show direction mirrors it; no motion on first render and under `motion-reduce`
- Tried CSS only (animation delay vs transition delay): the two timers drift, causing a one frame jump
- Test: root attribute stays unset until first collapse, flips on hide and on return
- Proof: `.evidences/task-09eb5fe7/` video, screenshots, per frame deltas (max step 96px before, 21px after)
