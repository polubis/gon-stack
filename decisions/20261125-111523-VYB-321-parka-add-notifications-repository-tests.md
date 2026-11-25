---
ticket: VYB-321
scope: parka/notifications
summary: Add notifications repository tests with msw
why: Notifications repository had no tests for paging, error mapping and chunked delete.
date: 2026-11-25
tags: [notifications, tests]
---

- module chosen: notifications, only mappers, format, diff and flow were tested, repository fetch layer was not
- tests via msw: first page, cursor and limit query, error message on list, mark read ok and fail
- delete: chunks of NOTIFICATIONS_MAX_DELETE, empty selection sends nothing, failing chunk rejects
- evidence: text log of the unit run, no UI change
