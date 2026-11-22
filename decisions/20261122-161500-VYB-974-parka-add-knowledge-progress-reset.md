---
ticket: VYB-974
scope: parka/knowledge
summary: Add progress reset for topics and reels in knowledge
why: Learners could not start a course or reel over while browsing, only mark reels done by viewing them.
date: 2026-11-22
---

- Topic reset = new `DELETE /api/knowledge/topics/:id/progress` deleting progress rows of all topic reels, owner-checked, via `fromSupabaseError`.
- Reel reset reuses `PUT /api/knowledge/progress` with `done: false`, no new endpoint.
- UI: reset icon in topic row (only when something is done) and in the viewer header (reel, or lesson on the end screen).
- Topic/lesson reset asks confirmation through `DeleteDialog` with `confirmLabel` "Resetuj"; reel reset is instant, easy to redo.
- Viewer header button replaced an end-screen button: extra button moved the stage centre and broke the swipe-down e2e.
- Optimistic counter drop with rollback and error toast; success toast "Postęp zresetowany".
