---
ticket: VYB-294
scope: parka/notifications
summary: Add bulk delete of notifications and 30 day auto purge
why: Users could not remove notifications, so the list only grew. Select mode with one confirmed bulk delete, plus expiry, keeps it short.
date: 2026-11-13
tags: [parka, notifications, delete]
---

- Header: select button turns into an actions menu (popover in the URL modal stack, same as the time add menu), its only item is delete
- Confirm modal is stacked via URL too (`notifications-delete`), reuses the dashboard `ConfirmDeleteDialog`
- Select mode: checkbox per row, selection bar with count, select all and cancel
- Delete is optimistic, a failure restores the list and shows a retry toast
- New `DELETE /api/notifications/` takes `ids` (max 100, client chunks bigger sets), RLS scopes rows
- 30 day expiry: no scheduler exists, so `GET /api/notifications/` purges rows older than 30 days first (`NOTIFICATIONS_RETENTION_DAYS`)
  - Trade-off: rows linger until the user opens the list, which is the only moment they are visible anyway
- Screen states the 30 day rule under the list
- Tests: unit flow (select, confirm, cancel, failure, note) and e2e delete flow
- Proof: `.evidences/task-a517fcad/delete-notifications.webm` (not committed)
