---
ticket: none
scope: parka
summary: Add voice dictation mic button to text fields
why: Dev wants to fill text fields by speaking instead of typing
date: 2026-10-26
tags: [dictation, speech, inputs, a11y]
---

- `ClearableInput` (text/search) gets mic toggle left of the "x" button; task description textarea (inline + fullscreen) too
  - Browser Web Speech API, `pl-PL`, interim results shown live, transcript appended to existing text, normal `onChange` flow
  - Hidden when API unsupported (SSR-safe via `useSyncExternalStore`); skipped for email/password/tel/url, disabled, read-only
  - Mic denied/other failure: error toast `title:tech-code:description:close:retry` (`DICTATION_NOT_ALLOWED`), rendered via portal
  - `aria-pressed` + label `Dyktuj: <field>` / `Zatrzymaj dyktowanie: <field>`, sr-only live status, pulse off under `motion-reduce`
- Shared `setNativeValue` helper reused by clear button
- Proof: `.evidences/parka-dictation.webm` (scripted fake recognizer, mocked backend)
