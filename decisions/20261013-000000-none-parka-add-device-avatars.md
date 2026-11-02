---
ticket: none
scope: parka
summary: Per-device avatar chosen in settings, shown next to expenses
why: Dev wants to recognise the device an expense was made from by a picture of their choice
date: 2026-10-13
tags: [devices, settings, supabase, avatar]
---

- Docs first: `4.expenses.md` (Expense Device), `9.settings...md` (Device Avatars), `dictionary.md` (`[device]`, `[device_avatar]`)
- DB migration: `device_avatars` (`user_id`, `device_id`, `avatar`), owner-only RLS, one row per account and device
- Fixed catalog of 12 avatars (`shared/device/domain/avatars.ts`); `device` contract gets server-set `avatar`, null means the type icon
  - Expense list/create/update join the user's avatars; stale ids outside the catalog fall back to null
- Settings API: `GET` lists devices derived from the user's expenses with avatars; `PUT` upserts or clears avatars only for devices the user owns expenses of
  - No new endpoint; reuses settings optimistic update with toast and rollback
- FE: `DevicesCard` in settings (radiogroup per device, default icon option), `DeviceAvatar` used by list badge and expense popup
- Tests: settings flow (pick, reset), list avatar, server `toDevice`, vibe-test e2e (settings choice shows in expenses)
