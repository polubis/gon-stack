---
ticket: VYB-313
scope: parka/ui
summary: Add tests for number input, state components and task plural
why: Daily test routine, these shared pieces had no coverage while modules already did.
date: 2026-11-16
---

- Picked shared ui and time domain, the biggest gap left after VYB-914..927 and VYB-312 (knowledge, PR 130)
- NumberInput: comma decimal, partial value, letters ignored, clear gives zero, integer mode
- EmptyState, ErrorState, LoadingBanner, ScopeNote: roles, heading level, retry, back link, idle banner empty
- pluralTasks: Polish forms for 0, 1, 2-4, 5+, 12, 22, 25
- Accessible selectors only, no mocks needed, no HTTP so no msw
