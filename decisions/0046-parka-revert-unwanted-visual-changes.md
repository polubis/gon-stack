---
ticket: none
scope: parka
summary: Revert unwanted visual changes from token pass
why: The dark palette followed the OS and recolored the whole app, while e2e runs light and never saw it
date: 2026-09-29
---

- Cause: 0045 added a dark palette under `@media (prefers-color-scheme: dark)`.
- Dark OS = whole app recolored.
- Playwright runs light, so e2e never saw it.
- Dark palette now opt-in: `:root[data-theme='dark']`. Never follows OS. No toggle yet.
- Light tokens restored to exact former values: `--line` 0.05, `--hover-soft` 0.03 (expense rows), `--track-strong` 0.15 (toggle), `--danger-strong` #e11d48 (rose-600: trend up, progress bar), `--danger-faint` #fff1f2 (rose-50 hover)
  - `text-micro` 10px / `text-caption` 11px in rem (chart labels, quick actions;
  - were `text-xs` 12px), bar min height 3px.
- `LoadingBanner` now absolute overlay on a `relative` root - no layout space (was +20px at top of both screens).
