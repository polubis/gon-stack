---
ticket: VYB-243
scope: repo
summary: Visual e2e specs run in a pinned Playwright Docker image
why: Screenshots differ per OS and fonts, so win32 and linux baselines drifted and needed double updates
date: 2026-11-12
---

- `pnpm test:e2e:visual` and `:update` run `scripts/visual-e2e.mjs`, which starts `mcr.microsoft.com/playwright:v<catalog version>-noble`.
- Container installs the engines Node, uses its own node_modules and pnpm store volumes, then runs turbo e2e only for apps with visual specs.
- vibe-test config splits specs by title `matches visual baseline`: native runs skip them, `VIBE_VISUAL=1` runs only them.
- Removed all `-chromium-win32.png`; kdebek home and privacy-policy `-linux.png` regenerated on Ubuntu fonts (cookies ones matched).
- PR CI still skips e2e; visual job in CI left as follow-up.
- Alternative (browser only in Docker via run-server) not built.
