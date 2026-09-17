# 0006 - CLAUDE prerequisites, coord agent, reference polish

```json
{
  "status": "done"
}
```

Tighten `CLAUDE.md` prerequisites to one always-on line: check `references/aodi-framework.md` + `rules/general.md` before any task. Add `agents/coord.md` (Planner → specialists → verifiers orchestration; Coord implements nothing). Index updates: list `aodi-framework.md` in References; fix template path to `templates/AGENTS.md`; replace empty agents stub with coord link. Polish refs: title on `aodi-framework.md`; `frontend-architecture.md` adds `src/__log__/`, optional `domain/*.ts` / `integration/*.ts` slots, and `apps/parka/src/modules/dashboard` as example.

Prerequisites were split across legend + boundaries; agents catalog was stale ("empty for now") while coord shipped. Single prerequisite line + coord entry keeps agent onboarding accurate. Consequence: start at AODI legend + general rules; multi-agent work routes through coord persona.
