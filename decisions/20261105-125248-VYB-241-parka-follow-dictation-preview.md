---
ticket: VYB-241
scope: parka
summary: Keep dictation preview on newest speech, double its size
why: Long dictated text hid the newest words and the preview was too small to read
date: 2026-11-05
---

- Preview textarea scrolls to its bottom on each speech result while listening
- User edits do not move the scroll position, so text higher up stays in view
- Default preview size doubled: rows 3 to 6, min-h-16 to min-h-32, max-h-40 to max-h-80
  - Unit test covers follow on speech and no jump on typing
- Phone e2e `time/__e2e__/dictation-phone.spec.ts` (412x915): fake speech, edit at top mid-dictation, insert on accept
- Recorded video of the phone run kept as evidence for VYB-241
