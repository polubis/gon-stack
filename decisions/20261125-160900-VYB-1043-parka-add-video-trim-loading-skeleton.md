---
ticket: VYB-1043
scope: parka/time
summary: Add skeleton to the Przytnij wideo dialog while it reads the video
why: Loading state was a bare text line that jumped into two sliders, breaking the skeleton and no-jumping-UI rules.
date: 2026-11-25
tags: [time, ux]
---

- video-trim-dialog: placeholder shaped like the two labelled sliders and the length line, in a `role="status"` with sr-only `Wczytywanie wideo…`
- same height as the loaded content so nothing jumps when the duration arrives
- new e2e id `time:trim-loading`
- tests: unit holds `readDuration` pending, expects status then two sliders
- evidence: one recording across 320, 480, 640, 768, 1024, 1280, 1440, 1920 px with the read delayed 2.5 s to show the skeleton
