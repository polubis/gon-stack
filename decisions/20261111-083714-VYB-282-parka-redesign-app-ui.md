---
ticket: VYB-282
scope: parka
summary: Redesign whole Parka UI as Aurora system
why: User wants award-level look from task-app inspiration, presentation only, logic untouched
date: 2026-11-11
tags: [ui, design-system, dark-mode]
---

- Aurora system in single theme file `core/style/index.css`
  - Pearl surface with peach/lilac aura, white cards with big radii, ink actions, lime accent as fill only
  - Dark theme flips brand to lime, obsidian `hero-card` with glows
  - Utilities `bg-aura`, `glass`, `cta`, `hero-card`, `pressable`; all motion off under reduced motion
  - Outfit variable font self-hosted in `public/fonts`
- New shared pieces: `Ring` progress, `BrandMark` tile, `ScreenHeader` eyebrow for two-weight titles
- App shell: floating glass dock and sidebar, active item as pill
- Public pages: floating glass pill nav, landing with decorative `aria-hidden` product preview, auth cards on aura, privacy page as card
- Brand assets recolored to obsidian + lime: favicon, og image, PWA icons, manifest, theme-color per color scheme
- Only presentation changed: all `data-e2e`, roles, aria labels and Polish copy kept
- taste-skill says no lavender; kept lavender only as ambient background because inspiration image uses it
- Playwright MCP could not launch (Chrome channel missing, no sudo); checked visually with bundled Chromium scripts instead
- Local e2e project ran on spare port 4327 because foreign wrangler holds 4325; real-backend e2e project not run
- Before/after proof as one sequential video in `.evidences/none/`, recorded by cheaper model, not committed
- Scope deck rendered with `mp4-powerpoint` skill at 1920x1080 instead of skill default 1080x1350, because dev wanted desktop format; screenshots replace code panels as proof
- Both videos attached to Parka task VYB-282
