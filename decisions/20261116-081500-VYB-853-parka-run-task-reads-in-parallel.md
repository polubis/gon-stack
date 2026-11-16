---
ticket: VYB-853
scope: parka/time
summary: Run independent task comment and history reads in parallel
why: Ownership check, list read and avatar lookup waited on each other for no reason.
date: 2026-11-16
---

- Area: task comments and task history procedures, backend reads; not covered by VYB-849/850/851/852
- Comments: task check, comments, auth user and avatar start together, then token names; 4 round trips to 2
- History: task check and history start together; 3 round trips to 2
- Ownership check still decides first: foreign task keeps 404, a read error of the other query is raised after it
  - Cost: foreign task id now also triggers one discarded user-scoped read; RLS and `user_id` filter keep it empty
- `list-task-attachments` left alone: the stale update must finish before the select, order matters
- Public response unchanged
- Test: latency test with fake timers, red on old code, green on new; existing suites green
