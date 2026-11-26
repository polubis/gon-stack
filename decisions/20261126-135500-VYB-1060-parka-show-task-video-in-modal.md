---
ticket: VYB-1060
scope: parka/time
summary: Open task video attachments in the modal player instead of a new tab
why: Video name was a target=_blank link, leaving the app; thumbnail already opened the modal viewer, name did not.
date: 2026-11-26
tags: [ux, attachments]
---

- ready video name is now a button opening the existing `AttachmentViewer` (URL modal stack), same as the thumbnail
- other files (pdf, text, images) keep the link; image scope not asked
- no new component: reused viewer, same `time:attachment-link` e2e id
- tests: unit for name click opens player and no link, e2e extended to open from name
- evidence: recording of name click opening the player modal, mocked backend, untrimmed (no ffmpeg)
