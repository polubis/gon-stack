---
ticket: none
scope: repo
summary: Always run Parka DB migrations on deploy
why: Push-diff detection skipped a migration after a failed deploy, leaving prod schema behind the code
date: 2026-10-26
tags: [ci, supabase, parka]
---

- Remove `Detect migration changes` step from `deploy-parka.yml`
  - It compared only previous push vs current, so a migration from a failed deploy was never retried
- `Migrate DB` always runs `supabase db push`
  - No-op when the schema is current
