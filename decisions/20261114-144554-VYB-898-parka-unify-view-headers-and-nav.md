---
ticket: VYB-898
scope: parka/navigation
summary: Unify main view headers, drop mobile nav titles, Wasze eyebrow
why: Main views differed in padding and title layout, mobile nav showed a title, and shared accounts still read "Twoje".
date: 2026-11-14
tags: [parka, layout, navigation, copy]
---

- Finanse header now uses `ScreenHeader` like Czas and Ustawienia; same wrapper, `pt-2` main, `max-w-7xl` on all three
- Period control moved from the dashboard header into its main
- Mobile `AppNav` shows icons only; the label stays as `sr-only` text for the accessible name
- New `useOwnerEyebrow` (settings module): "Twoje"/"Twój" become "Wasze"/"Wasz" once settings report more than one device
- Device count comes from one `GET /api/settings/` on first use, or from the settings view when it loads
- Dashboard flow test ignores the settings call; new tests for nav and eyebrow
- Proof `.evidences/VYB-898/viewports.png` (not committed): 8 widths x 3 views, headers and nav boxed
