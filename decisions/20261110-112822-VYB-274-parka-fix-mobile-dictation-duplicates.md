---
ticket: VYB-274
scope: parka/dictation
summary: Stop duplicate dictated words after pause and resume on phones
why: Phones re-deliver the previous take after a restart, so every resume repeated the text already in the field
date: 2026-11-10
tags: [parka, dictation, mobile, bugfix]
---

- Bug: after pausing and tapping "Dyktuj dalej" on a phone, the text was folded in again (`prawda` became `prawda prawda`); closing and reopening the popup hid it because `reset` clears the carried text
- Fix: the hook keeps the segments of the stopped session; a resumed session that starts with the same segments skips them, while a genuinely new repeated word is kept
  - Undecided until the first result shows whether the phone re-delivers, so no partial text is folded twice
  - `start` without resume and `reset` drop the carried segments
- Chose a segment comparison over extending the single-word dedup in `extend`: a repeated word spoken on purpose must stay
- Tests: unit red on the old hook (`kup mleko prawda kup mleko prawda ale`), green on the fix; the repeat-after-pause case passes on both
