---
ticket: VYB-939
scope: parka/time
summary: Mirror the loaded time layout in its skeleton so nothing jumps
why: Finance does not jump on load, time swapped a short two-card skeleton for a tall screen on every viewport.
date: 2026-11-17
---

- Measured: hero and tasks card moved, whole page grew 712px to 2535px on mobile when data arrived
- Skeleton now renders summary, tasks, and all six statistics cards in the loaded grid order, spans and heights
- Hero placeholder keeps the same classes as the real hero, so it matches to the pixel at 390, 768 and 1280
- Month placeholder takes the anchor and draws the real number of calendar rows
- Task rows 58px like the loaded rows, 8 of them
- Limit: an empty period still hides summary and statistics, so it shrinks after load
