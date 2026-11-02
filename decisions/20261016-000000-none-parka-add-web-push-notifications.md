---
ticket: none
scope: parka
summary: Add web push notifications for new in-app notifications
why: Dev wants push notifications on devices, toggled in settings, and no SMS
date: 2026-10-16
tags: [push, notifications, vapid, service-worker, workers]
---

- SMS audit: app has no SMS code/settings/schema; only Supabase CLI auth defaults mention it, left untouched
- Docs first: `9.settings-notifications-and-privacy.md` (Notifications 4-8)
- Own Web Push on WebCrypto (VAPID ES256 + aes128gcm), no Node-only lib, runs on Workers
- `push_subscriptions` (user_id, endpoint, keys), owner RLS; migration also makes `push` default off
- `PUT /api/push/` upserts a subscription; saving settings with push off deletes all of the user's subscriptions
- `recordNotifications` pushes after insert via `deliverPush`; never fails the user's change, 404/410 subscriptions deleted
- FE: `public/sw.js` shows push and opens `/app/notifications/`; toggle enables (permission, subscribe) / disables (unsubscribe)
  - States: unsupported, unconfigured, blocked shown as hint; denied permission gives error toast `PUSH_PERMISSION_DENIED`
- Env: `PUBLIC_PARKA_VAPID_PUBLIC_KEY`, `PARKA_VAPID_PRIVATE_KEY`, `PARKA_VAPID_SUBJECT`
- Tests: encryption + VAPID verified by decrypting as a browser, delivery/cleanup, settings toggle flow
