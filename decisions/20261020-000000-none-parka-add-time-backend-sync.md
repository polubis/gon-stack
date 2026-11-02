---
ticket: none
scope: parka
summary: Time module backed by Supabase with defined requirements
why: Time module was static UI; tasks, categories and priorities must persist per account
date: 2026-10-20
tags: [parka, time, tasks, backend, supabase, requirements]
---

- Requirements: `docs/requirements/10.time.md`, terms `task`, `task_category`, `task_priority` in `dictionary.md`
- DB: migration `20261020090000_time_tasks.sql`
  - `time_categories`, `time_priorities`, `time_tasks`, composite PK `(user_id, id)`, RLS owner policies, FK `on delete restrict`
  - Default categories (work, home, health, learn, rest) and priorities (low 2, medium 5, high 9) seeded by trigger on `auth.users` and backfilled
  - Own tables, not expense categories (isolation, as the module already copies the pickers)
- API (Zod in/out in `schemas/time.ts`, procedures + `astroAdapter`)
  - `GET /api/time/?from&to` returns categories, priorities, tasks of the range
  - `POST /api/time/tasks/`, `PUT|DELETE /api/time/tasks/:id/`, `POST /api/time/categories/`, `POST /api/time/priorities/`
- Module follows frontend-architecture: `core` (rxjs bus, store, handlers), `domain`, `integration`, `presentation`
  - Optimistic create/update/delete/done toggle, rollback + error toast (code, retry), success toast
  - Layout route `time-layout` keeps one store across day/week/month/year
  - Viewed day lives in `?date=`; prev/next arrows and "Dzis" link; real clock replaces hardcoded "now"
  - Skeleton only on the first load; later period/view changes keep data and show the shared loading banner, error state with retry, empty state naming the period
  - Task done toggle, delete with confirmation (stacked URL modal), category colour from data instead of tone classes
- Tests: msw-backed flow tests, domain + contract tests, real-backend e2e `modules/time/__e2e__/time.spec.ts` (added to the real-backend project)
- `db-schema.ts` regenerated with current Supabase CLI (extra `ComputedFields`/relationship noise)
