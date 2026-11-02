---
ticket: none
scope: repo
summary: Bump pnpm catalog and packageManager
why: Keep workspace on current patch/minor releases under the single catalog source of truth established in 0130
date: 2026-10-09
---

- Refreshed the monorepo dependency catalog in `pnpm-workspace.yaml` (astro, next, wrangler, radix, playwright, supabase, turbo, and related pins), extended `minimumReleaseAgeExclude` for newly pinned releases
  - bumped `packageManager` to `pnpm@11.28.5`, and regenerated `pnpm-lock.yaml`.
