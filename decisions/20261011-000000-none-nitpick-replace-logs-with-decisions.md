---
ticket: none
scope: nitpick
summary: Scattered __log__ dirs replaced by root decisions/
why: One place and one short, machine-checked format make entries findable and keep each commit to exactly one
date: 2026-10-11
---

- Moved all 155 `__log__` entries to `decisions/NNNN-<scope-prefix>-<verb>-<object>.md` with `git mv`, renumbered 0001-0155 by the date each was added
  - Converted mechanically to the new format: frontmatter (`ticket`, `scope`, `summary`, `why`, `date`, `supersedes`) plus a nested bullet list; status json dropped
  - Lossy condensation of prose to bullets, test-count noise dropped, in-text references to old numbers rewritten to new ones
- Nitpick rule `log-entry` replaced by `decision-entry` (`createDecisionEntry({ scopes })`)
  - Validates name (next free number, scope-prefixed verb-first slug), strict frontmatter, length bounds and body shape
  - New files under any `__log__/` are reported as wrong location
  - Own minimal parser for the flat YAML subset, no new dependency
  - `git.stagedFiles` added to the check context; a commit touching only `decisions/` files needs no new entry
- Template `.claude/templates/decision-entry.md`, rule `general.md` #3, `doctor.md`, `frontend-architecture.md`, nitpick README/handoff and `.ai/` updated
- Git reports heavily rewritten moves as added files: commit the moves with unchanged content first, then the conversion, then the rest
