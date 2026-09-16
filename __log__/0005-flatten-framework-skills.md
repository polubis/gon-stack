# 0005 - flatten skills out of `skills/framework/`

```json
{
  "status": "done"
}
```

Move framework skills to top-level `skills/`: `check-html`, `clone`, `do-ui`, `document-module`, `feature-workflow`, `hashy`, `plan-be`, `plan-db`, `plan-domain`, `plan-fe`, `plan-requirements` (+ `references/template.md`), `plan-ui`. Update `CLAUDE.md` skill links to `skills/<name>/SKILL.md` (no `framework/skills/` nest).

Nested `skills/framework/skills/` made catalog paths long + easy to mis-link. Flat `skills/<name>/` matches other skills. Consequence: one skill root; discover via `CLAUDE.md` table.
