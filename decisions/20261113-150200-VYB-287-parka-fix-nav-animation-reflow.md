---
ticket: VYB-287
scope: parka/navigation
summary: Nav hide animates opacity and translate, rows collapse once
why: Animating grid rows and flex sizes resized content every frame, so it lagged and jumped when the bottom nav hid.
date: 2026-11-13
tags: [parka, navigation, animation, performance]
---

- Bottom `NavSlot`: rows collapse as one discrete step after the slide (transition-delay), only opacity and translate animate
- Bottom `AppNav` items: dropped flex-grow, max-width and margin transitions, color and label opacity still fade
- Bench (390x844, CDP): content resizes per hide/show 9 and 13 before, 1 and 1 after
  - Layouts: hide 13 to 4, show 16 to 1, tab switch 23 to 6
- Proof: `.evidences/VYB-287/nav-animation.webm` and `bench.log.txt` (not committed)
