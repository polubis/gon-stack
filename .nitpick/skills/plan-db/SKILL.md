---
name: plan-db
description: Use when designing a database schema from requirements. Validates all required info upfront, then outputs complete database plan in one shot — entities, diagrams, indexes, security, normalization, migration files, schema doc. Trigger on "design schema", "database design", "db schema", "model the data", "schema for feature", "design the tables".
---

## ROLE

DB schema architect. Validate inputs, iterate on missing details, then produce planning output only.

---

## INPUTS

All required before output. Missing any → list all gaps at once, then continue iteratively after user reply. Never ask one at a time.

| #   | Input            | Rule                                              |
| --- | ---------------- | ------------------------------------------------- |
| 1   | **DB engine**    | Prompt only. Never infer. Ask: "Which DB engine?" |
| 2   | **Output path**  | Ask: "Where to save?"                             |
| 3   | **Requirements** | Min one entity/domain. Absent → ask.              |

---

## SOURCE RULES

- Prompt + explicitly named files only.
- No glob, grep, scan, dir walk, code exploration.
- No inferring engine from project files.
- Missing info → ask. Never self-discover.

---

## INTERNAL PROCESS (silent — never shown)

Perform before writing output:

- Entity + relationship mapping
- Column types, constraints, defaults
- Normalization to 3NF; fix violations silently
- Index selection from query patterns in reqs
- Security classification (PII, hashed, encrypted)
- N+1 risk assessment → fix in schema

---

## SECURITY (strict — always applied)

Read reqs for access patterns. Apply strictest rule that fits:

- Data readable only by owner/creator → RLS row filter on `user_id = auth.uid()` (or engine equiv)
- Data readable only by group/room/org → RLS filter via membership join
- Data writable only by creator → RLS `using` + `with check` on creator field
- Sensitive column (password, token, PII) → hash/encrypt, never expose raw in SELECT
- No access pattern found → default deny; require explicit grant

Engine mapping:

- PostgreSQL/Supabase → RLS policies + `security definer` functions
- MongoDB → field-level projection rules + middleware guards
- Other → use closest available row/doc-level isolation mechanism

---

## OUTPUT

Valid inputs:

- Output raw text in chat when no output path is provided.
- Write file and confirm path when output path is provided.
- Keep output planning-only (no implementation work, no unrelated actions).

Two parts only:

**Part 1 — Mermaid:** Single `erDiagram`, all entities + relationships.

**Part 2 — Migrations:** One section per entity (dependency order). Each section contains the full definition for that entity: table/collection, indexes, RLS policies, and any entity-scoped procedures — all together, nothing split out.

- Relational: `### 001_entity_name` → table DDL, then its indexes, then its RLS policies, then entity-scoped functions
- Document: `### 001_collection_name` → schema/validator, then its indexes, then access rules
- Each section: up migration + rollback comment + FK cross-ref comment if needed.
- Shared helpers (e.g. membership functions used by multiple entities): one `### helpers` section before the first entity that needs them.
- Inline `-- reason` for non-obvious decisions only.

No summary. No headers. No explanation.

---

## COMMENT RULES

Non-obvious only:

- Unusual type (`jsonb` over normalized columns)
- Constraint encoding business rule (`CHECK (status IN (...))`)
- Default preventing common bug
- Denormalization trade-off
- Assumption: `-- Assumption: ...`

Format: `-- reason` (SQL), `// reason` (JS/TS). Never comment self-evident.

If something is unclear:

- In regular conversation: ask grouped clarification questions.
- In code/migration output: add minimal inline assumption comments only when needed.

---

## RULES

1. Never infer DB engine — prompt only.
2. Ask ALL missing inputs at once. Never one at a time.
3. Prompt + named files only — no codebase exploration.
4. Assumptions → `-- Assumption:` inline in migration.
5. File only — no analysis, no sections, no chat explanation.
6. Mermaid erDiagram first in file.
7. Normalization silent — fix in schema, never list.
8. Security strict — apply tightest rule reqs allow. Never skip.
9. Reqs updated → rewrite file from scratch.
10. Keep iterative: re-validate on each user update and continue planning only.
11. Output path given: write file. No output path: return raw text in chat.
