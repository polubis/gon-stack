# 0013 - Coord agents roster, reviewer, flow-only-in-coord

```json
{
  "status": "done"
}
```

Created `.claude/agents/reviewer.md` (read-only rules check, `rule | status | evidence` table as response, no fixes) and the 14 missing agents from the `coord.md` lane table: `planner.md`, `solution-architect.md`, `technical-leader.md`, `frontend-developer.md`, `backend-developer.md`, `database-developer.md`, `ux-specialist.md`, `accessibility-specialist.md`, `tech-seo.md`, `ui-designer.md`, `automation-tester.md`, `tech-quality-verifier.md`, `q-a.md`, `scrum-master.md`. All follow the `coord.md` shape (frontmatter `name` + `description`, role, Read before work, Responsibilities, Rules, Validation, Output). Removed `## Flow` from every agent file so flow lives only in `coord.md`. Renamed `accessibility` to `accessibility-specialist` to match the `ux-specialist` naming. Extended the agents table in `.claude/CLAUDE.md` with all new agents.

Reason: the coordinator referenced agents that did not exist and flows were duplicated across agent files. Consequence: every lane entry resolves to a file, flow is defined once in `coord.md`, and agent names state their roles.
