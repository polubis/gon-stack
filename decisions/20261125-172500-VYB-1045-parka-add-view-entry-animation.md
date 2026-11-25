---
ticket: VYB-1045
scope: parka/ux
summary: Add view entry animation to AI info and Privacy screens
why: UX rule 10 wants every view entry animated as a whole; these two screens popped in without fade, unlike siblings.
date: 2026-11-25
tags: [ux, animation]
---

- ai-info and privacy root get `animate-view-enter` with `motion-reduce:animate-none`, same as notifications, settings, data-export
- e2e `view-entry.spec.ts` checks animation runs, and is none under reduced motion
- evidence: 3 webm covering 320..1920 viewports (not committed)
