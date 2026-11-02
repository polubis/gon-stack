---
ticket: none
scope: parka
summary: Parka expense stores the device it was created from
why: Know which device each expense came from
date: 2026-10-11
---

- DB: migration `20261011090000_expense_device.sql` adds `device_id/name/type` (all-or-none, type checked) to `expenses`; old rows stay null.
- API: `device` (nullable) in the expense contract; create stores it, list/update return it, update never overwrites it.
- FE: `shared/device` (pure UA / UA-CH detection of type + name like "Chrome on Windows", stable per-browser id in localStorage, lucide icon per type).
- New expenses send `currentDevice()`; edit keeps the stored one.
- UI: list row shows icon + name from `sm` up, icon only below (name for screen readers), same row height; popup shows icon, name and full id.
- Tests: detection + id persistence unit, list/popup/create integration, desktop + mobile e2e.
