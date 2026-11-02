---
ticket: none
scope: repo
summary: Decision files named by datetime, not number
why: Parallel PRs took the same NNNN and clashed on rebase; datetime, ticket and slug avoid it
date: 2026-11-02
---

- New name: `decisions/YYYYMMDD-HHmmss-<ticket>-<scope-prefix>-<verb>-<object>.md`, no NNNN number
  - Reason: each PR took next free number, rebase clashed on same name
  - Datetime + ticket + slug: no renumber on rebase
- Rule `packages/nitpick/src/rules/decision-log.ts` now checks every file in `decisions/`, not only staged
  - Same ticket + slug as another entry rejected (duplicate)
  - `supersedes` takes full name of older entry, no `decisions/` and no `.md`
- Migrated 273 existing entries with `git mv`
  - Datetime = frontmatter `date` at `000000`, original time not recorded
  - Dup slug `parka-move-selectors-to-presentation` (0053) renamed `parka-move-report-to-presentation`
  - `supersedes` and `apps/parka` code comments point to new names
- Going forward: entry datetime = real local time when written
