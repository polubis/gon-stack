---
ticket: VYB-899
scope: parka/ui
summary: Unify card padding, radius and title typography app-wide
why: Cards differed per module (p-2, p-4, lg:p-6, rounded-2xl, text-sm titles); finance cards are the reference.
date: 2026-11-14
tags: [ui, card, typography]
---

- Finance `Card` (rounded-3xl, p-4) and `text-base font-semibold` titles are the standard
- Categories drops its own rounded-2xl Card and uses the shared one
- Time day, month and skeleton cards lose p-2 md:p-4; week day cards use rounded-3xl p-4
- Reports card loses lg:p-6
- Card titles in settings, devices, privacy, access tokens, categories and time views move from text-sm (ink-soft) to text-base
- Added unit test for shared Card spacing and radius
