---
ticket: VYB-986
scope: parka/auth
summary: Shorten account drawer edit button to one word
why: UX rule 18 wants one-word button names; context comes from location, aria-label stays descriptive.
date: 2026-11-24
tags: [ux, auth]
---

- change: visible text `Edytuj profil` -> `Edytuj`, `aria-label="Edytuj profil"` kept, so selectors and screen readers unchanged
- tests: unit asserts accessible name `Edytuj profil` with visible text exactly `Edytuj`
- evidence: one webm walks all 8 supported viewports (320-1920) with drawer open
