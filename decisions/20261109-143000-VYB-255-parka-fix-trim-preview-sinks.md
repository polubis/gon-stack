---
ticket: VYB-255
scope: parka/time
summary: Trim step reads duration from the file, not from a DOM URL
why: CodeQL flagged js/xss-through-dom where a picked file's URL fed a video element
date: 2026-11-09
---

- Duration comes from `mediabunny` container metadata, no hidden `<video>` needed
- Preview URL is created by `previewUrl` and used only when it is a `blob:` URL
- First frame shown by seeking to 0.1 s on metadata load instead of a `#t=` fragment
