---
ticket: VYB-1059
scope: parka/notifications
summary: Bring back header button to mark all as read
why: Owner wants one-click mark-all beside the select button, same size, own icon and role.
date: 2026-11-26
supersedes: 20261115-081610-VYB-913-parka-move-mark-read-into-selection-menu
tags: [notifications, ux]
---

- Header button "Oznacz wszystkie jako przeczytane" with CheckCheck icon, same round button style as "Zaznacz"
- Disabled when nothing unread; optimistic flip, failure restores and offers retry
- Restored handler, event, facade, repository call to existing read-all endpoint
- Selection menu item "Oznacz zaznaczone jako przeczytane" and per-row button stay
- Unit and e2e tests cover success, rollback, disabled state
