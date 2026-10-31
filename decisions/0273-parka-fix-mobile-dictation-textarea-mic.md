---
ticket: VYB-221
scope: parka/dictation
summary: Fix phone dictation and align textarea mic/x with inputs
why: Mic meter stream starved SpeechRecognition on phones; textarea mic and x were laid out apart from inputs
date: 2026-10-31
tags: [dictation, mobile, textarea]
---

- Root cause: `VoiceOverlay` opened `getUserMedia` for the level meter while `SpeechRecognition` ran; phones give mic to one consumer, so recognition got no audio
  - Meter now desktop only (`currentDevice().type`); phones show looping bar animation
- New `ClearableTextarea` in `shared/ui/clearable.tsx`; `DescriptionField` uses it
- `Adornments` shared by input and textarea: mic far right when empty, slides left when x appears
- Not verified on a real phone; Android Chrome continuous-mode duplicated interim text not addressed
