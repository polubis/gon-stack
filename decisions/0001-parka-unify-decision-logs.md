---
ticket: none
scope: parka
summary: Unify `__activity__`/`__decision__` into single `__log__`
why: Two dirs per task meant two files and duplicated metadata; one file covers both why and what
date: 2026-09-14
---

- Merged every module's `__activity__` + `__decision__` pair (server, shared/walkthrough, `__e2e__`) into one `__log__` dir per module, one file per task, matching format `# {id} - {summary}` / json metadata block / description / reason.
- Added canonical template at `.claude/templates/task-log.md`.
- Updated repo `CLAUDE.md` (Way of work + AI sections) to reference `__log__` instead of the two old dirs.
- Removed old `__activity__`/`__decision__` dirs after migrating content.
- Updated `shared/walkthrough/AGENTS.md` references.
- Two separate dirs per task (why vs what/when) meant every task needed two files, often duplicating id/module/status frontmatter for no benefit — cross-linking via `decision_ref` was the only thing tying them together.
- One file per task with a minimal json metadata block (`status` required;
  - `models`/`inputTokens`/`outTokens`/`cost`/`workTimeInMinutes` included only when actually known) plus description + reason covers both jobs without the split, and without fabricating unknown numbers
    - (same reasoning as old 0007 activity entry).
- Consequence: future tasks write one `__log__` entry instead of two; modules adopting the convention only need one dir.
