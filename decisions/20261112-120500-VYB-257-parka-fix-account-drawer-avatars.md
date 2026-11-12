---
ticket: VYB-257
scope: parka
summary: Account drawer opens beside the nav avatar and shows pictures
why: Uploaded pictures live in the public avatars bucket, not auth metadata, so the account list had none; the drawer also ignored the trigger position on desktop
date: 2026-11-12
---

- Cause of missing pictures is data, not security: the bucket is public, the list read only auth metadata.
- `list-accounts` falls back to the public bucket URL of each account; `AccountAvatar` shows the initial when the image fails to load.
- Active account row prefers the live profile picture, so a fresh upload shows at once.
- Desktop drawer anchors beside the nav trigger with bottom edges level; mobile keeps the right-side drawer.
- Inactive accounts without a picture request a 404 image once per open; accepted, no per-account existence check without a server lookup.
