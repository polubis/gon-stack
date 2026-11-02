---
ticket: none
scope: repo
summary: fix pnpm audit vulnerabilities
why: audit reported 2 critical, 6 high, 7 moderate, 1 low
date: 2026-10-23
tags: [security, deps]
---

- Bump `next`, `@next/eslint-plugin-next` to 16.4.1; `vitest`, `@vitest/coverage-v8` to 4.1.12
- Refresh transitive deps via `pnpm update -r --depth Infinity` (no new overrides)
  - Fixed `vite`, `source-map-js`, `http-cache-semantics`, `@vitest/mocker`
- Replace stale `next@16.3.8` entries in `minimumReleaseAgeExclude` with `next@16.4.1`
- Remaining: `braces` 3.0.3 (no patch), `sharp` 0.35.4 (pinned by miniflare), `postcss-selector-parser` 6.0.10 (pinned by `@tailwindcss/typography`)
