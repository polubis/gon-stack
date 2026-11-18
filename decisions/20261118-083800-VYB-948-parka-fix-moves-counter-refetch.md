---
ticket: VYB-948
scope: parka/time
summary: Refetch move counters after writes settle
why: Counter read moves on optimistic task change, before PUT saved the history row, so it lagged one move.
date: 2026-11-18
---

- Cause: `useMoves` fetched on every `tasks` change; optimistic change fired GET before the PUT wrote the move row
- Fix: facade `usePending` exposes writes in flight; `useMoves` fetches only at zero pending, so it reads after the last PUT answered
  - Two quick moves give one read after both, queue keeps writes in order
- Test (msw): two quick "Przenieś na jutro" show 2/2 in the card, fails without the fix
  - Mock backend now records a move on day change and can slow task updates
- Evidence: video of real Supabase run, counters read right after clicks, no reload
