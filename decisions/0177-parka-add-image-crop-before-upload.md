---
ticket: none
scope: parka
summary: Shared image editor (crop, zoom, rotate) before upload
why: Dev wants to choose the visible area of avatars and device photos instead of uploading the whole picture
date: 2026-10-16
tags: [upload, image-editor, a11y, modal-stack]
---

- Docs first: `9.settings...md` (Profile Avatar, Device Photos), `dictionary.md` (`[image_editor]`)
- New shared module `shared/image-editor` (domain crop math, integration canvas decode/export, presentation dialog + `useImageEditor`)
- Flow: pick -> existing FE validation -> editor -> confirm sends edited square PNG (max 512 px); cancel sends nothing
  - Invalid or undecodable file skips the editor, so callers keep reporting their own error
- Editor is a Radix dialog stacked via URL modal stack (`modal=image-editor:<key>`), Back/Escape cancel
  - Preview canvas is the export renderer (WYSIWYG); drag, arrow keys, +/- , zoom slider, rotate buttons
- Wired in settings: profile avatar and device photo (device icon avatars are a fixed set, no upload)
- Tests: crop math unit, hook integration (jsdom canvas stub), settings flows, vibe-test e2e with real PNG
- Note: e2e runs `wrangler dev` on built `dist`: rebuild before running specs
