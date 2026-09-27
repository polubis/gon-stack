# 0012 - Agent frontmatter plus coord rewrite

```json
{
  "status": "done"
}
```

Added Anthropic-style `name` and `description` frontmatter keys to `.claude/templates/AGENTS.md`, keeping the existing `version` and `hash` keys and the relative-path-only scaffold body untouched. Rewrote `.claude/agents/coord.md` into subagent format with `name`, `description`, `tools`, and `model` frontmatter, replacing the bespoke mermaid-heavy shape with a short role, responsibilities, rules, validation, and output plus a lane table of the plan, specialist, and verifier roles.

Reason: agent files need delegation-ready metadata in frontmatter while project knowledge stays in `CLAUDE.md`, rules, and references; the old coord had no frontmatter at all. Consequence: coord carries machine-readable delegation metadata and the single module template exposes `name` and `description` for future agent use.
