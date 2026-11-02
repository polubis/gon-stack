---
ticket: none
scope: parka
summary: Fix settings (Wiecej) view against UI/UX rules
why: Settings clipped content at 320px, stretched at 1920px, duplicated controls and lacked a mirroring skeleton
date: 2026-10-14
tags: [settings, ui, ux, rwd, a11y]
---

- Settings view: entry animation (`animate-view-enter`, off with `motion-reduce`), content centered with `max-w-6xl`
  - 2 columns from `lg` with equal card heights
- Removed `Wyloguj` (lives in the user panel) with its dead code (sign-out handler, `logout`)
- Profile card without `Edytuj`: avatar is the button opening photo change, name/e-mail fields always visible
  - `Zapisz` enabled only after a change, Enter submits, long values wrap
- Removed duplicate `Powiadomienia` link (bell in header stays); `Eksport danych` uses `Download` icon
- Skeleton mirrors the real layout
- Settings tests moved to msw; new `profile-edit.test.tsx`
