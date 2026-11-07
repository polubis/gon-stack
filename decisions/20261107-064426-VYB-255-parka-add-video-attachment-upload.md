---
ticket: VYB-255
scope: parka
summary: Attach videos and files up to 20 MB with trim and background upload
why: Tasks need screen recordings and larger files; upload must not block the UI
date: 2026-11-07
tags: [attachments, video, upload, web-worker, mcp]
---

- Attachment limit raised 5 MB to 20 MB; photos stay 5 MB (re-encoded to WebP first)
  - New types: mp4, webm, mov, zip, csv, json, markdown, docx, xlsx, pptx; migration updates bucket limits and size check
  - MCP `add_task_attachment` takes the same types; request body cap 8 MB to 28 MB
- Upload runs in a module-level background queue (XHR), so closing the popup does not stop it
  - Row shows a progress bar; finished upload raises a toast with "Przejdź do pliku" that opens the task
  - Toast with an action stays until closed (WCAG timing)
- Video row shows the first frame only (no autoplay, no controls); viewer plays with native controls
- Picked video opens a trim dialog (native player, start/end sliders); cutting runs in a dedicated web worker via `mediabunny` (MPL-2.0)
  - Trim dialog is local state, not a URL modal: a picked `File` cannot survive a reload
- Backend still receives one multipart POST per file; the "async" part is non-blocking UI, not a server job queue
