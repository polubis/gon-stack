---
ticket: VYB-307
scope: parka/navigation
summary: Keep nav space fixed, slide nav and add button by transform
why: VYB-305 collapsed the nav space as one step, so the page jumped; the nav space must stay fixed while only the nav and the button move, with no clipping.
date: 2026-11-14
tags: [parka, navigation, animation, layout]
---

- Cause: collapsing the nav rows resized the scroll column 768 to 844 px and shifted scrollTop up to 88 px; the add button translated past the column bottom also grew scrollHeight
- `NavSlot` is back in the flow with a fixed height that is never collapsed; it only fades and slides (opacity, translate); `flow-root` keeps its margins in the measured `--bottom-nav-h`
- The bottom fade mask on the scroll column stays as on main
- New `FabLayer` in the shell sits right above the nav, outside the scroller; `FabRail` portals into it, so the button is neither clipped nor masked while it moves into the nav zone
- `FabRail` glides the button down by the nav height and holds it, then back on close (Web Animations, transform only); rest distance to the nav is 20 px as on main
- Rail classes in dashboard and time: `sticky bottom-4` became `relative bottom-4`, the layer replaces the stickiness
- Sequence in `nav-sequence` unchanged; `motion-reduce` snaps the button
- At 390x844 main moved the column 768 to 844 and scrollTop 88 px; now column 768, scrollHeight 2079, scrollTop 0 and nav 76 px constant; button ends 16 px from the screen bottom as on main
- Max button jump per frame 24.9 px on main, 31.6 px now (shorter 160 ms glide)
- E2E `no-layout-shift` now guards layout, nav height, rest distance and corner position; proof `.evidences/task-8321e338/` (not committed)
