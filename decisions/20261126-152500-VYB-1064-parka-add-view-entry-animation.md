---
ticket: VYB-1064
scope: parka/ux
summary: Add view entry animation to AI info, privacy and expenses
why: UX rule 10 says each view fades and slides in as a whole, but three views appeared without it.
date: 2026-11-26
tags: [ux, animation]
---

- audit: compared every module root against rule 10, found ai-info, privacy and expenses-management without `animate-view-enter`
- added existing `animate-view-enter motion-reduce:animate-none` to their root, same as settings and data-export
- chose reuse of the shared token over a new keyframe, no new CSS
- tests: new e2e checks animation-name is view-enter, and none under reduced motion
- evidence: one recording with 8 iframes (320-1920), animation slowed to 0.2x, mocked backend
