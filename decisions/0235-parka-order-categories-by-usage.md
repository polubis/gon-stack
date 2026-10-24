---
ticket: none
scope: parka/time
summary: Order task categories by usage
why: Most used categories sit first so picking one takes fewer taps
date: 2026-10-24
tags: [parka, ux, time]
---

- `sortByUsage` (time domain): count of tasks per category, descending
  - ties keep the stored order, so the default pick stays stable
- Time context exposes `categories` ordered from loaded tasks and backlog
  - no new request or field; counts follow the viewed period plus backlog
  - used by the task category picker and the categories list
- `CategoryPicker` freezes the order at mount; chips never jump while editing, new category goes last
- Finance categories not changed: expenses are not loaded where the pickers live, counting would need new requests
