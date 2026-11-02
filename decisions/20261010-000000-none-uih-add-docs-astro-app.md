---
ticket: none
scope: uih
summary: Uih-docs static docs app
why: Show documented uih components with a fast edit loop
date: 2026-10-10
---

- Added `apps/uih-docs`: pure SSG Astro app (React + Tailwind, no adapter) documenting `@repo/uih`.
- Pages: overview, Button (usage, variants, disabled).
- Dev refresh: Vite aliases `@repo/uih/button` and `@repo/uih/theme` to `packages/uih/src`, so TS/CSS edits in the library hot-reload in `astro dev` with no package rebuild.
- `tsconfig` paths mirror the alias for `astro check`.
