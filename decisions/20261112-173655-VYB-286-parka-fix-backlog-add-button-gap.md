---
ticket: VYB-286
scope: parka/time
summary: Remove empty band under the sticky backlog add button
why: The sticky bar stopped at the dialog padding edge, so the button floated 41 px above the bottom with list rows peeking underneath.
date: 2026-11-12
tags: [parka, time, backlog, layout]
---

- Sticky bar offset changed from bottom-0 to -bottom-5, cancelling the dialog p-5 so the bar reaches the real bottom
- Gap under the button measured on real backend: 41 px before, 21 px after (20 px padding + 1 px border), phone and desktop
- Rows no longer show under the bar
- Real backend e2e measures the gap with a 14 task backlog, before and after scrolling
