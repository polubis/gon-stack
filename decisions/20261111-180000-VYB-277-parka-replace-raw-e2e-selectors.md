---
ticket: VYB-277
scope: parka
summary: E2e specs find elements by typed data-e2e ids only
why: Rule asks for unique type-safe selectors per module; 111 raw role and text lookups broke on copy changes
date: 2026-11-11
---

- Replaced every raw `getByRole`, `getByText`, `getByLabel` and `locator` in parka e2e specs with typed `data-e2e` ids.
- Components take the id through their existing `ComponentProps`; ids live in each module's `e2e-ids.ts`, dynamic ones as `prefix:${string}`.
- `getByE2e` and `getByE2ePrefix` in vibe-test accept an optional scope, so rows are searched inside their own container.
- Shared ids for toast action, select options, empty state, device icons, dictation and theme root.
- Text-only checks became `toContainText` on a container id; screens check the heading text inside the screen root.
- Ran the full e2e on a built wrangler server against local Supabase: 114 passed. The 4401 dev server had a broken SSR dep cache, so it was not used.
