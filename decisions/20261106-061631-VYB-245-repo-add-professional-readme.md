---
ticket: VYB-245
scope: repo
summary: Replace Turborepo starter README with branded project README
why: Root README described the create-turbo starter, not gon-stack apps, packages, workflow or brand
date: 2026-11-06
---

- Root README rewritten, structure inspired by Addy Osmani agent-skills README
  - Centered hero banner, shields.io badges, PR CI status, nav row, mermaid workflow, collapsible details
  - Template and sandbox section: ready-made apps plus AI ecosystem (rules, skills, agents, nitpick, vibe-test, evidence, decisions)
  - Apps table marks deployed apps: parka, kdebek, polubinski-dev (`deploy-*.yml`), polubinski.dev from wrangler routes
- New root `assets/` with hand-written SVGs: logo, logo-dark, logo-mark, logo-mark-dark, favicon, banner, banner-dark
  - Mark: owner-picked monogram "Stair Slice G", GreenOn sibling: 3D extruded G cut into 3 horizontal slabs shifted left, center, right like a staircase
  - Mint-to-green face gradient (#5ff5b3 to #0bad67), extrusion #066644, one glyph reused via `<use>`, checked at 512, 128, 32, 16 px
  - Lockup: mark plus custom stroke wordmark, `gon` green, `-stack` navy #0b2545 (light) or #f2f3f3 (dark)
  - Favicon: same mark with heavier strokes for 16-32 px, one file for light and dark
  - Banner: big mark left, wordmark, tagline, 4 chips, faded large staircase G on right, no author text (moved to hero caption)
  - Light/dark swap via `<picture>` and prefers-color-scheme
- Owner avatar `assets/avatar.png`: 256 px PNG from apps/polubinski-dev/public/adrian-512.webp, source already round with alpha so GitHub shows circle
  - Hero caption under banner links GitHub profile and polubinski.dev
- GreenOn Software logo copied from apps/kdebek/public/images/green-on-logo.svg, dark variant only recolored to kdebek dark secondary token
- Facts taken from package.json files, workflows, rules and decisions only
- Added MIT LICENSE, copyright Adrian Połubiński, linked from README with an Author section
- Proof: slow-scroll video in .evidences/VYB-245 (gitignored)
