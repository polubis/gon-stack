---
ticket: VYB-305
scope: parka/navigation
summary: Sequence nav hide, add button move and menu by animation end
why: Parallel animations plus a guessed collapse timer made the add button race the nav; each step should start when the previous one ends.
date: 2026-11-13
tags: [parka, navigation, animation]
---

- New `nav-sequence` store: rest, navOut, fabDown, ready, fabUp; each step waits for `getAnimations().finished` of its element, no fixed delays
- Not rendered or nothing to animate (desktop, `motion-reduce`) ends the step at once; reversing cancels the step and takes the shortest way back
- `NavSlot` slides and fades out, then its rows collapse as one step; `FabRail` cancels the layout shift and glides the button with Web Animations (transform), continuing from its position when reversed
- `useSequencedOpen` holds both add menus back until `ready`; a second click on the trigger while waiting cancels
- Removed `NavFollow`, the collapse timer, `data-nav-collapsed` and the keyframes of VYB-304
- Tried keeping the nav space and translating the button down: the scroller clips it and focus scrolls it, so the collapse stays
- Slow frames 20 to 21 and max frame 250 to 150 ms (4x throttle), jump 20.6 to 25 px (eased glide), click to menu 250 to 550 ms by design
- Proof: `.evidences/task-ee679b99/` videos, frame sheet, benchmark (not committed)
- Bumped catalog `astro` 7.3.8 to 7.4.7 (new advisories failed the pre-commit audit) and pinned `@emnapi/runtime` to 1.11.3, its beta crashed `astro check`
