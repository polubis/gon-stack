---
ticket: VYB-961
scope: parka/time
summary: Task status as n/N label, next-step button, edit in More menu
why: Circle tile and bar were noise; one label shows progress and one clear control moves the task forward.
date: 2026-11-20
---

- Replaced circle/spinner status tile with a meta line label: icon + "n/N name", readable without colour, custom steps counted via `progress()` in domain/status
- Label keyed by step, fades in on each status change, `motion-reduce` off; row height stable, no jump
- New next-step button (chevrons-right, aria-label `Następny krok: <title>`) where the pencil was; icon swap animates
- Last step (done): button turns into reopen (`Otwórz ponownie`) and goes back to first step; backlog rows have no status, so no button
- Edit moved to first item of the More menu (same aria-labels, `time:task-edit`)
- Task lists gap-2 between items
- e2e ids: `time:task-progress-badge` became `time:task-step`, `time:task-done` became `time:task-advance`
- Tried a bottom step rail first, dropped after review as noise
