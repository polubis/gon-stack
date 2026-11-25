---
ticket: VYB-1057
scope: parka/nav
summary: Fix main nav so only a sliding pill moves
why: Active item grew and shifted siblings, nav jumped on navigation. Equal fixed slots plus one transform pill keeps layout still and smooth.
date: 2026-11-25
tags: [nav, ux]
---

- bottom nav: 4 equal grid columns (3 links + account), no grow on active item, icons fixed size
- sidebar: fixed h-12 items, no pressable transform on links
- new `NavIndicator`: absolutely positioned cta pill, moves by `translate` from CSS var `--nav-index`, GPU only, off under motion-reduce
- no measuring in JS: slot size and gap are known, so pill width and offset are pure calc
- e2e `static-nav.spec.ts`: item boxes unchanged after navigation, pill lands exactly under active item (narrow and wide)
