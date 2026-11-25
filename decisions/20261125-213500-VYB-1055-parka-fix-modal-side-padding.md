---
ticket: VYB-1055
scope: parka/ui
summary: Reserve scrollbar gutter on both modal edges
why: Scrollbar made modal right padding bigger than the left one; both-edges gutter keeps sides equal.
date: 2026-11-25
---

- `scroll-in-radius` utility gets `scrollbar-gutter: stable both-edges`, shared by every scrolling modal, no per-modal copy
- Rejected smaller right padding: overlay scrollbars (phones) would then skew the other way
- Cost: modal content 24px (1.5rem) narrower, always symmetric
- e2e check on cookie banner: gutter and equal side space, phone and desktop
