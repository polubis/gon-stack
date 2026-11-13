---
ticket: VYB-301
scope: parka/navigation
summary: Bottom nav hides faster with fewer slow frames on overlay open
why: Blurred backdrop re-rasterized every frame of the slide and the 200ms slide plus 200ms collapse felt slow.
date: 2026-11-13
tags: [parka, navigation, animation, performance]
---

- `NavSlot` bottom: slide and collapse delay 200ms to 150ms, `will-change` translate and opacity
- Hidden nav drops `backdrop-filter` (frosted blur) so the slide stays on the compositor
- Bench (390x844, 5 runs): settled 322ms to 263ms, slow frames 16 to 7.8, max frame 39ms to 31ms
- Proof: `.evidences/VYB-301/bench.log.txt` (not committed)
