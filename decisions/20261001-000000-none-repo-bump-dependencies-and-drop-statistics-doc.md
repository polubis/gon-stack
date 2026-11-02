---
ticket: none
scope: repo
summary: Dependency bumps and statistics doc removal from hashy manifest
why: Keep dependencies current; the statistics doc left the hashy manifest with the statistics merge
date: 2026-10-01
---

- Bumped `wrangler` -> 4.145.0, `next` and `@next/eslint-plugin-next` -> 16.3.8, `turbo` -> 2.11.6, `pnpm` -> 11.28.3 across apps and root; extended `minimumReleaseAgeExclude` in `pnpm-workspace.yaml` for the new releases.
- Removed the `statistics` module entry from `hashy.modules.txt`.
