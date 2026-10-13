---
ticket: none
scope: parka
summary: Upload a profile avatar stored as 32/64/128/256 WebP variants
why: Dev wants a personal picture in settings instead of the default profile icon
date: 2026-10-13
tags: [avatar, upload, storage, webp, validation]
---

- Docs first: `9.settings...md` (Profile Avatar), `dictionary.md` (`[profile_avatar]`)
- Upload is the only write: `POST /api/avatar/` (multipart) and `GET /api/avatar/`; no delete, no other profile change
- Validation on FE and BE with one shared rule set (`shared/avatar/domain`)
  - Max 10 MB, non-empty, only JPEG/PNG/WebP/GIF detected by magic bytes (declared type and name ignored, SVG refused)
  - BE also decodes the file via the Images binding, so a valid header over garbage is refused with 400
- Processing on Workers via Cloudflare `IMAGES` binding (sharp does not run in workerd; local wrangler emulates it)
  - Square cover crop scaled from the original to 32, 64, 128, 256, each WebP quality 40
- Storage: public Supabase bucket `avatars`, path `<user_id>/<size>.webp`, owner-only write policies
  - `profile_avatars` table (owner-only RLS) holds `updated_at`, used as `?v=` cache buster
- FE (settings module): `ProfileAvatar` replaces the default icon, `srcset` over variants
  - Optimistic preview via object URL, rollback + error toast with retry, success toast
- Tests: FE/BE validation unit, contract, variants builder, settings integration, vibe-test e2e
