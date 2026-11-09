---
ticket: VYB-255
scope: parka/time
summary: Video task attachments with trim, async save and live progress
why: Tasks needed short recordings as proof, not only photos, PDF and text
date: 2026-11-09
---

- Videos (mp4, webm, mov, mkv, ogg) up to 20 MB join the attachments; other files keep 5 MB, 5 files per task
  - Migration: bucket limit and mimes, row size check, `status` column, table published to Realtime, `mcp_list_task_attachments` returns status
- Picked video opens a trim step first (stacked URL modal `attachment-trim`)
  - Two native range inputs; cut runs on a dedicated web worker with `mediabunny`
  - "Dodaj bez przycinania" skips the cut; cancel drops the file
- Upload shows a progress bar (XHR upload progress)
  - Server answers right after the row insert (`uploading`), stores the bytes in `waitUntil`, then flips the row to `ready` or `failed`
- Realtime: SSE `/api/time/attachments/events/` relays Supabase Realtime changes of the owner's rows
  - UI updates the list live and shows a toast with an "Otwórz" action when a video is ready; failure gives an error toast
- Hardening: cancel button on a sending file aborts the request (the server stops on the abort signal)
  - A video deleted while saving cleans its file up after the background save
  - Live feed reload: list is fetched again on every SSE (re)connect, missed "ready" still toasts
  - Listing marks videos stuck in `uploading` over 5 min as `failed`
- Video rows show a first-frame preview (no autoplay); the viewer plays it with native controls
- MCP `add_task_attachment` takes videos (body cap 28 MB), list returns `status`; still no download tool
- Toast success variant got an optional action
- Tests: rules, MCP, UI (preview, status, realtime toast, trim, cancel, size), e2e flow on the real backend with recorded video
- Prod: apply migration `20261109090000_task_attachment_videos.sql`
