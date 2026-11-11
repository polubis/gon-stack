---
ticket: VYB-277
scope: parka/auth
summary: Account isolation test sets memory via public hook
why: Test wrote form-memory storage directly; setup now goes through the public field hook, as a form would
date: 2026-11-11
---

- `account-isolation.test.tsx` no longer imports `readRemembered`/`writeRemembered` from storage internals.
- Remembering and recalling use `useRememberedField`, the same path forms use.
- Not done, need Supabase run (none available here): 111 raw e2e selectors to `data-e2e`, local e2e regression run.
- `backend.spec.ts` test.skip left as is, covered by decision 20261002 pending the split.
- msw-5 leftovers and AAA full sweep left for team confirmation.
