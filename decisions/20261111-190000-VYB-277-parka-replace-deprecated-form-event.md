---
ticket: VYB-277
scope: parka/time
summary: Backlog form submit uses the SubmitEvent type
why: React marks FormEvent deprecated (TS 6385); the submit handler only ever gets submit events
date: 2026-11-11
---

- `backlog-add-dialog.tsx` types its submit handler as `SubmitEvent<HTMLFormElement>` from React.
- Behavior unchanged; the existing backlog tests cover adding and editing through the form.
- Other files still use `FormEvent`; left out of this ticket.
