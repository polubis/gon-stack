---
ticket: VYB-968
scope: parka
summary: Add soft marker on tasks that are in progress
why: Started tasks looked like open ones at a glance, only the small n/N label differed.
date: 2026-11-21
tags: [time, ui]
---

- Started row (any step between open and done) gets thin brand bar on the left edge, aria-hidden, fades in, off with motion-reduce
- Row gets `data-started` attribute so tests read state without style details
- Bar is absolutely placed, no extra padding, row layout does not jump
- Unit test walks open -> started -> done and checks marker only on started
