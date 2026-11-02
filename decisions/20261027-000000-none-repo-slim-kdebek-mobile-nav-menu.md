---
ticket: none
scope: repo
summary: Make mobile nav menu rounded and slim
why: Open mobile menu looked bulky and its panel lacked rounded corners, glued to the bar
date: 2026-10-27
tags: [kdebek, navbar, mobile, ui]
---

- Navbar (`navbar.astro`)
  - Mobile panel is a separate floating card (`rounded-2xl`, `mt-2` gap under bar) instead of a square-cornered extension of the bar
  - Slimmer spacing: panel `p-2`, links `py-2`, CTA `py-2.5`
  - Bar keeps its own radius (no more `rounded-t-3xl` toggling)
  - Open/close animates height + fade, close now visible (panel hidden after transition); `motion-reduce` disables transition
  - Toggle state read from `aria-expanded`
- Proof: before/after video recorded locally at 390 wide viewport, not committed
