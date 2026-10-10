# 0040 - uih-docs MDX per-component docs

```json
{
  "status": "done"
}
```

Docs now come from MDX: `src/docs/<slug>.mdx` in a content collection (`src/content.config.ts`, glob loader, zod frontmatter `title | description | order`). One dynamic route `src/pages/[slug].astro` (`getStaticPaths` from collection) renders each; nav and overview are generated from the collection. Added `@astrojs/mdx` and `@tailwindcss/typography` to the pnpm catalog. `button.astro` replaced by `button.mdx` (live demos import `@repo/uih/button`).

Verified: build, `astro check`, lint; Playwright recording of nav + live MDX edit via HMR at `apps/uih-docs/recording/mdx-docs.webm` (gitignored).

Reason: control each component page from markdown only; new component = new `.mdx` file.

Follow-up: `button.mdx` got an "Override with Tailwind" section (layer order + live demo). Proven in Chromium on the built page: `className` utilities replaced bg, color, radius, padding, border, font size/weight and hover bg over `ds` styles, no `!important`.
