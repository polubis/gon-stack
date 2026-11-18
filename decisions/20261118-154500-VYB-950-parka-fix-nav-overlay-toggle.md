---
ticket: VYB-950
scope: parka/navigation
summary: Fade the whole frosted bottom nav with the add menu
why: Opacity on the nav wrapper cut the backdrop blur at once, so the blur snapped away instead of animating with the nav.
date: 2026-11-18
---

- Moved opacity and translate transition from NavSlot wrapper to the frosted nav element, so the blur fades and slides with it
- Wrapper now transitions only visibility; it flips after the slide, dropping the blur layer and keeping sequence timing (getAnimations)
- Wrapper space and inert/aria-hidden unchanged, layout does not move
- Added e2e test: nav hidden while add menu open, back after close
