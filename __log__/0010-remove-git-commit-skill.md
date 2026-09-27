# 0010 - remove git-commit skill

```json
{
  "status": "done"
}
```

Removed `git-commit` skill (`.claude/skills/git-commit/SKILL.md`) and its reference from `.claude/CLAUDE.md`. Expanded `.claude/rules/git.md` with the full Conventional Commits template (subject line, scoped body list, `Reviewed-by` / `Refs`, breaking-change `!` suffix) so agents no longer depend on a separate skill for message shape.
