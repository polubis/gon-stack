---
ticket: none
scope: parka
summary: Time tasks get devices and recurring rules like expenses
why: Tasks must show where they were made and repeat like recurring expenses, without a second mechanism
date: 2026-10-20
tags: [parka, time, tasks, devices, recurring, supabase]
---

- DB: migration `20261021090000_time_devices_recurring.sql`
  - `time_tasks` gets the same `device_*` columns and completeness check as `expenses`, plus `recurring_id`, `occurrence_date`, unique (rule, occurrence)
  - `time_recurring` (rule: title, category, priority, hour, interval, start/end, `last_materialized_date`), RLS owner policy, FK `on delete restrict`; tasks keep `on delete set null (recurring_id)`
- API
  - Device reuses `shared/device` (`deviceColumns`, `toDevice`, profiles): written on create only, update never changes it
  - Recurring reuses `dueOccurrences` (generalised to `RecurringSchedule`); `GET /api/time/` materializes occurrences up to `to`, idempotent, forward-only mark so deleted tasks stay gone
  - `POST /api/time/recurring/`, `DELETE /api/time/recurring/:id/` (ends series, tasks stay)
  - Settings device list, device photo upload and device profile update also count task devices
- Module
  - New task takes `currentDevice()`; row shows badge, popup shows device block
  - Add dialog: "Powtarzaj" toggle with interval and optional end; saving sends a rule, then reloads the viewed range
  - Occurrences carry no device (same as recurring expenses); no rule editing yet, only create and end series
- Ending a series asks for confirmation (stacked URL modal reusing `DeleteDialog`, ux rule 7)
- Range menu: arrows/Home/End now also reach "Dziś" (keyboard users reached it only with Tab); click path of "Dziś" could not be reproduced as broken (build, dev, touch, 390/1280px, motion on/off), covered by regression tests
- Tests: device + recurring flow tests (msw), contract tests, real-backend e2e steps (device kept, series forward, deleted task not revived, end series)
