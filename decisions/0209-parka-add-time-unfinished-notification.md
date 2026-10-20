---
ticket: none
scope: parka
summary: Time module warns at end of day about unfinished tasks
why: Open tasks of the day should surface in the same notification screen and push as expenses, with the module titles consistent
date: 2026-10-20
tags: [parka, time, notifications, titles]
---

- New notification kind `time-day-unfinished` (day + open tasks), listed on the existing notifications screen and pushed
  - Own tile, not a before/after diff: pending count (`Do zrobienia: N zadań`) + `Przejdź do zadań` link to the time view of that day
  - `GET /api/time` takes optional `tz`; from 20:00 local it files one notification per day for undone tasks
  - Fixed id `time-day-unfinished:<day>` + ignore-duplicates upsert: repeat or parallel reads add nothing, push sent once
  - Notification failure never fails the time read
- Time screen header gets the same bell (`UnreadLink`) as finance
- Time title uses the finance title size (`ScreenHeader` `titleClassName`)
- Finance title is now "Finanse" instead of the greeting
- Tests: no diff rows and tile summary + link for the new kind, server rule (evening, early, all done, once)
