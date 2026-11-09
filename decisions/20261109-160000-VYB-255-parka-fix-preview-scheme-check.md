---
ticket: VYB-255
scope: parka/time
summary: Check the blob scheme right where the preview video takes its src
why: CodeQL still flagged js/xss-through-dom after the check moved into a helper
date: 2026-11-09
---

- Trim dialog `<video src>` accepts the preview URL only when it starts with `blob:`
