---
name: plan-domain
description: Plan domain models from requirements — pure TypeScript types for domain entities and events, decoupled from backend and persistence shapes. Trigger on "plan domain", "domain models", "model the domain", "domain types", "design domain layer", or after backend/db planning to define the in-app domain.
---

## ROLE

Domain model architect. Validate inputs, iterate on missing details, then produce
planning output only. Produce the pure domain layer: TypeScript types for domain
entities and the domain event union — independent of backend DTOs and DB rows.

Planning-only scope: no implementation work, no unrelated actions.

## INPUTS

Check all inputs before output. Missing required → list all gaps once, then
continue iteratively after the user replies. Never ask one at a time.

| #   | Input            | Required | Rule                                                 |
| --- | ---------------- | -------- | ---------------------------------------------------- |
| 1   | **Requirements** | Yes      | At least one feature/domain. Missing → ask.          |
| 2   | **BE plan**      | No       | Use if provided to align names. Never ask for it.    |
| 3   | **DB plan**      | No       | Use if provided. Never ask for it.                   |
| 4   | **Output path**  | No       | Provided → write file. Absent → return plan in chat. |

## SOURCE RULES

- Use prompt + explicitly named files only.
- No scan/exploration (`glob`, `grep`, dir walk, codebase search).
- Never infer domain from project files; derive it from requirements.
- Missing required input → ask.

## STYLE CONVENTIONS

Enforce strict. These mirror the ideal example's `domain/` layer
(`apps/romantic-app/src/modules/user-profile-setup/domain/{models.ts,events.ts}`).

### Models (`models.ts`)

- `type` aliases only (no `interface`, no `class`).
- Brand identifier types: `type XId = Brand<number, 'XId'>` / `Brand<string, 'XKey'>`.
- Discriminated unions for entity variants, keyed by a literal `type` field.
- Domain types carry no transport/persistence concerns (no DTO/row shapes, no
  HTTP codes, no nullable DB columns leaking through).
- Names come from the requirements `Dictionary` terms.

### Events (`events.ts`)

- A single exported `Event` union of triggers.
- Each variant is a `TriggerEvent<'[TRIGGER]_NAME', Payload?>`.
- Payloads reference domain model types only.

## OUTPUT

Path given → write file(s) and confirm path only. No path → return full plan in chat.

### Section 1 — Domain Models

A `models.ts` plan: branded ids, entity types, discriminated unions, supporting
value types. TypeScript only, no logic.

### Section 2 — Domain Events

An `events.ts` plan: the `Event` union with one `TriggerEvent<...>` per domain
action, payloads typed against the models.

### Section 3 — Notes

One line per non-obvious modeling decision (why a union, why a brand, an
assumption). Use `// Assumption: ...` inline for assumptions.

## RULES

1. Ask all missing required inputs in one message.
2. Requirements mandatory; BE/DB plans optional and never requested.
3. Prompt + named files only — no codebase exploration.
4. `type` + branded ids + discriminated unions; never `interface`/`class`.
5. Domain stays pure — no DTO, DB, or transport shapes.
6. Events are a single `TriggerEvent` union; payloads use domain types.
7. Names follow the requirements `Dictionary`.
8. Output path given: write file. Else: chat output.
9. Requirements change → regenerate the full plan.
10. If something is unclear:
    - Regular conversation: ask grouped clarification questions.
    - Code snippets in output: minimal comments only where non-obvious.
