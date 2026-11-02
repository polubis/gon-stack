---
ticket: none
scope: uih
summary: Uih-docs MDX per-component docs
why: Control each component page from markdown only; new component = new `.mdx` file
date: 2026-10-10
---

- Docs now come from MDX: `src/docs/<slug>.mdx` in a content collection (`src/content.config.ts`, glob loader, zod frontmatter `title | description | order`).
- One dynamic route `src/pages/[slug].astro` (`getStaticPaths` from collection) renders each; nav and overview are generated from the collection.
- Added `@astrojs/mdx` and `@tailwindcss/typography` to the pnpm catalog.
- `button.astro` replaced by `button.mdx` (live demos import `@repo/uih/button`).
- Follow-up: `button.mdx` got an "Override with Tailwind" section (layer order + live demo).
- Proven in Chromium on the built page: `className` utilities replaced bg, color, radius, padding, border, font size/weight and hover bg over `ds` styles, no `!important`.
