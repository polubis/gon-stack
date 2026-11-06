---
ticket: VYB-246
scope: nitpick
summary: Rule files drop group list line when marked unlisted
why: Rules with own file duplicate the group list entry, git.md only needs the rule itself
date: 2026-11-06
---

- Removed `general` rule group, decision-log moved to `git` group
- Boss flow drops the markdown step that pointed at general.md
- CLAUDE.md gets "During modification follow conventions/style around" as first line
- New optional `RuleUnit.unlisted`: group file skips the rule, its own file is still written
- `rich-commit` and `decision-log` marked unlisted in `.nitpick/config.ts`
- Test: unlisted file doc stays out of group file but is written
