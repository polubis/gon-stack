---
ticket: VYB-158
scope: parka/limits
summary: Limits always notify and are managed in a modal
why: Users only choose the threshold of a limit; notification is not optional. Management moves from widget sheets into URL-stacked modals like categories
date: 2026-10-27
tags: [parka, limits, notifications, ux]
---

- Limit has `alertAt` (percent, 1-100) instead of `alertAt80` toggle and `delivery` radio
  - Migration `20261028100000_limit_alert_threshold.sql` is additive: new `alert_at` column, old columns kept unused
- Server notifies when a month's spending reaches `alertAt` (new `limit-reached` notification, once per limit, month and threshold)
  - In-app notification always; push on top only when the user enabled it
  - Checked after expense create and update
- Limits widget is read only, "Zarządzaj" opens the limits modal
  - List, add, edit stacked in URL modal stack; delete via stacked confirmation
  - Sheet-based forms and add button with tooltip removed
- Tests: limits modal flow, `limit-alerts` server unit, notification diff row; e2e specs moved to the modal
