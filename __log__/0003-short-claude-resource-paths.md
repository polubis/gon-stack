# 0003 - short `.claude` resource paths (no `.claude/` prefix)

```json
{
  "status": "done"
}
```

Align resource paths under `.claude/` to short form: `rules/…`, `skills/…`, `references/…`, `templates/…` — no `.claude/` prefix. Touch `CLAUDE.md`, `rules/general.md`, `references/frontend-architecture.md`, plus skill docs with local `references/` / examples. Skill-local refs stay skill-relative (`references/todo.md`).

Agents already scope under `.claude/`; full `.claude/dir/file.md` noisy + inconsistent. Short path = known root. Consequence: open `rules/general.md` / `templates/task-log.md` as if cwd = `.claude/`.
