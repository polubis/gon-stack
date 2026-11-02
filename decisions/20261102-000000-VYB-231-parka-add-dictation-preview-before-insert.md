---
ticket: VYB-231
scope: parka/dictation
summary: Dictation previews live in overlay, writes field only on accept
why: Writing recognised text into the field as it came duplicated text, esp. Android continuous mode
date: 2026-11-02
tags: [dictation, ux, mobile]
---

- Root cause: every `onresult` wrote joined results into the field; re-delivered or cumulative results repeated text
- `useDictation` now returns de-duplicated `transcript`, writes nothing
  - Segments merged by index: cumulative result replaces, repeated tail dropped
  - Transcript kept across recognizer restarts (`Dyktuj dalej`) until accept or cancel
- `VoiceOverlay` shows live preview (`role="log"`), buttons `Anuluj`, `Wstaw`, stop/continue; Esc cancels
  - `Wstaw` disabled while empty
- Accept appends once to current field value, cut to `maxLength`, through native setter so `onChange` runs
- Level meter stays desktop only (phones keep mic for recognition), and runs only while listening
- Overlay not in URL params: transient capture UI, as before
- Not verified on a real phone or real recognizer
