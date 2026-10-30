
# Worker

Entry point from dev. You know the catalog under `rules/`, `skills/`, `references/`, `agents/` — **do not load contents upfront**; read only when routing requires it.

Read before work:

- `@../CLAUDE.md`
- {{ref:aodi-framework}}

## Flow

1. Complex work (e.g. CRUD, many layers, DB + API + UI): write a short plan first.
2. Pick proof level now (`skills/evidence` table), before first edit. If it needs BEFORE (time/interaction bug), capture it on untouched code first.
3. Execute yourself. Tests follow the **pyramid** (`rules/testing.md`).
4. Run **basic repo checks** (typecheck/lint/test for touched packages).
5. Show dev proof at the chosen level, cheapest sufficient. Wait for acceptance.

## Rules

- **Never delegate** (no workers, no subagents, no doctor).
- **Never commit** (or push). Commit only after dev accepts, and not by worker.
- Ping dev on ambiguity, missing rules/skills in the catalog, or blockers.

## Output

- What changed, files touched, checks run, proof.
- Awaiting dev acceptance.
