---
ticket: none
scope: repo
summary: Pnpm workspace catalog for all external deps (exact)
why: One source of truth, no duplicate semver strings across 17 manifests, and exact pins so lockfile and catalog cannot drift silently
date: 2026-10-09
---

- Extended the pnpm `catalog:` pattern (started for `@radix-ui/react-popover` in 0121 / parka) to the whole monorepo: every npm dependency outside `@repo/*` is declared once in `pnpm-workspace.yaml` and referenced as `"catalog:"` in root
  - all apps, and all packages (`dependencies`, `devDependencies`, `peerDependencies`).
- **74** catalog entries; no `^` / `~` left in workspace `package.json` dependency fields (package `version` and `engines.node` unchanged).
- Nine version skews were merged to the **newer** pin already used in apps (not the looser peer ranges in `@repo/astro-config` / `@repo/vibe-test`): e.g. `astro` `7.3.5`, `@playwright/test` `1.63.0`, `react` `19.3.0`, `typescript` `6.0.3`
  - `sharp` `0.35.5`.
  - `@radix-ui/react-dialog` `1.1.23` added beside `react-popover` `1.2.0`.
- Decision: single catalog block in `pnpm-workspace.yaml` is the only place that pins external versions; `saveExact: true` stays as the add-time default.
