---
ticket: VYB-216
scope: parka/dictation
summary: Voice popup while dictating, mic slides left for clear X
why: X should show only with value and push the mic; dictation is single-run with a ChatGPT-style voice popup
date: 2026-10-27
tags: [parka, ux, dictation]
---

- `ClearableInput`: mic container transitions `right-2` -> `right-8` when value present; X pops in (`animate-clear-in`)
- `VoiceOverlay`: modal dialog + live mic-level bars (AnalyserNode), CSS loop fallback, Escape/stop button
  - Escape closes only the popup, never a dialog underneath
- Inline mic disabled while listening, `begin` guarded against re-trigger
- Tokens: `--z-voice`, animations in `index.css`, all `motion-reduce` safe
