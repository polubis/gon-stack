---
ticket: VYB-913
scope: parka/notifications
summary: Move mark-as-read into the selection actions menu
why: Header had a lone mark-all button next to select; bulk actions now live in one menu for consistency.
date: 2026-11-15
tags: [notifications, ux]
---

- Removed header button "Oznacz wszystkie jako przeczytane" and its handler, event and repository call
- Added menu item "Oznacz zaznaczone jako przeczytane (n)" to select-mode actions menu, next to delete
- Optimistic: selected unread rows flip to read, select mode ends, failure restores and offers retry
- Reuses per-id PUT, no backend change; read-all endpoint stays for other clients
- Per-row mark-read button kept
