---
ticket: VYB-198
scope: parka/access-tokens
summary: Pause and resume replace disable, rename and rotate for tokens
why: Pausing keeps the secret so clients reconnect without a new token; rename and rotate are no longer offered
date: 2026-11-04
---

- Token row: `Wstrzymaj` (pause) replaces `Wyłącz`; paused rows show `Wznów` (resume)
  - Pause asks for confirmation; resume runs without it
- Rename and rotate removed from UI: dialogs, secret reveal, `Zmień` and `Nazwa` buttons
- Server: `POST /api/mcp-tokens/:id/resume/` clears `revoked_at`; expired tokens stay expired
- Pause and resume are optimistic: rollback on error, retry in toast
  - Codes `ACCESS_TOKEN_PAUSE_FAILED`, `ACCESS_TOKEN_RESUME_FAILED`
- Rename and rotate server routes kept; no UI calls them, e2e checks rename through PATCH
- Dictation preview is an editable textarea: typed text is kept, speech continues after it
- Screen wake lock while dictating: released on accept, cancel or unmount, taken again when page is visible
