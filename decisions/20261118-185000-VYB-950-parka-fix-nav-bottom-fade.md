---
ticket: VYB-950
scope: parka/navigation
summary: Drop page bottom fade while add menu is open
why: A blurry fade band stayed over the empty nav slot behind the open add menu, the very overlay the ticket wants gone.
date: 2026-11-18
---

- The page scroll area keeps a bottom mask fade for the nav; it stayed on while the nav was away.
- New `NavScroll` in `nav-slot.tsx` applies the mask only at rest, so the open menu sits over a clean page edge.
- E2E checks the fade is gone with the menu open and back after it closes.
