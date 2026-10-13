---
ticket: none
scope: parka
summary: Upload an own photo for a device, mirroring the profile avatar upload
why: Dev wants to recognise a device by a real picture, not only by the fixed icon set
date: 2026-10-15
tags: [devices, upload, storage, webp, validation]
---

- Docs first: `9.settings...md` (Device Photos), `dictionary.md` (`[device_photo]`), `4.expenses.md` (photo replaces avatar and type icon)
- Reuse the avatar pipeline: same FE/BE validation (`validateAvatarFile`), same Images binding variants (32/64/128/256 WebP, quality 40)
- `POST /api/device-photo/` (multipart `deviceId` + `file`); device id regex-checked (storage path safe), device must own an expense (else 400)
- Storage: public bucket `device-photos`, path `<user_id>/<device_id>/<size>.webp`, owner-only write policies
  - `device_profiles.photo_updated_at` marks the photo, used as `?v=` cache buster
- Photo is server-set in the `device` contract (`photo`), joined by `loadProfiles` into settings and expenses
  - Settings PUT ignores it; resetting avatar/name keeps a row that still has a photo
- FE: `DeviceBubble` shows the photo over avatar/icon; settings row gets "Dodaj/Zmień zdjęcie urządzenia"
  - Optimistic preview, rollback + error toast with retry, success toast
- Tests: contract, `toDevice`, settings integration, vibe-test e2e; migration dry-run on local Postgres
