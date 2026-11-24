---
ticket: VYB-1029
scope: parka/time
summary: E2e for Duplikuj on board and backlog tasks
why: Duplicate needed browser proof against the real backend, the unit tests alone had none.
date: 2026-11-24
tags: [time, testing]
---

- e2e: `duplicate-task.spec.ts` duplicates a board task and a backlog task, asserts prefilled form and the copy in the list
- real-backend project: spec registered there, it needs auth plus Supabase
- helper: `duplicateTask` locator next to `editTask`
- evidence: webm of the e2e run attached to the task, no code change in production
