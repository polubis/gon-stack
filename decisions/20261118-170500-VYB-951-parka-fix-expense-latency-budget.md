---
ticket: VYB-951
scope: parka/time
summary: Relax expense write latency budgets
why: CI measured 125.5ms against a 125ms budget, a timing flake unrelated to the PR.
date: 2026-11-18
---

- Create budget 5x to 6x simulated latency, update budget 7x to 8x.
- Still fails on sequential round-trip regressions, tolerates slow CI runners.
