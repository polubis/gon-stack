---
ticket: VYB-197
scope: parka/time
summary: Pin backlog add button, show full task details
why: Adding to a long backlog needed scrolling; details clamped the description behind a show more popup
date: 2026-11-12
---

- Backlog dialog add button sits in a sticky bottom bar, reachable without scrolling the list.
- Task details show the whole description inline; the clamp, "Pokaż więcej" button and description popup are removed.
- Dropped `descriptionModal`, `TaskDescription`, `DESCRIPTION_CLAMP_LINES` and two e2e ids; old `task-description:` deep links are now ignored.
- Unit tests: long description shown whole, add button opens the form under a 15-task list; e2e spec updated.
- Sticky layout is not measurable in jsdom; only checked via e2e run, no screenshot taken.
