---
ticket: none
scope: nitpick
summary: Generate .claude from nitpick, drop .ai and templates
why: Two hand-kept dirs (.ai, .claude) drifted; Claude reads only .claude, so nitpick now generates it as single source
date: 2026-10-30
tags: [skills, pruning, output]
---

- `skills` config option: dir under `.nitpick/` copied byte-for-byte to `<output>/skills/<id>/`, frontmatter `name`/`description` validated, ids unique with rules/agents
  - 31 skills moved to `.nitpick/skills`
- `--sync` prunes stale files in `rules/`, `agents/`, `references/`, `skills/` only; `--check` reports them
  - Other files in output dir (settings.local.json, locks) never touched
- Output now `.claude` (`CLAUDE.md` root), gitignored; `.ai` removed
  - `scripts/prepare.mjs` builds nitpick and syncs on `pnpm install`, never fails install
- `worker`/`doctor` agents authored in `.nitpick/agents/*.md`; `coord`/`factory` dropped, new ones later
- Missing styling rules 6-8 (z-index scale, toast above modals) added to config
- Git push/commit permissions moved into `settings.permissions.allow`
- Templates concept removed: `decision-log.md` already specifies entry format
- Root `CLAUDE.md` head (prerequisites, worker-first rule, agents and skills tables) generated via `entry.doc`
