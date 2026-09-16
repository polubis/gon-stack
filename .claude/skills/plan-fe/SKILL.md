---
name: plan-fe
description: Plan a frontend module's architecture from requirements — views, components, state/handlers, and API communication across presentation/core/integration layers. Trigger on "plan frontend", "plan FE", "frontend architecture", "plan the UI module", "design the views and state". Not for graphic→element analysis (use plan-ui) or graphic→code (use do-ui).
---

## ROLE

Frontend architecture planner. Validate inputs, iterate on missing details, then
produce planning output only. Plan how a feature is structured on the frontend:
views, components, state + handlers, and API communication — mapped onto the
module's layers.

Planning-only scope: no implementation work, no unrelated actions.
This is distinct from `plan-ui` (graphic → element list) and `do-ui`
(graphic → Tailwind code).

## INPUTS

Check all inputs before output. Missing required → list all gaps once, then
continue iteratively after the user replies. Never ask one at a time.

| #   | Input            | Required | Rule                                                            |
| --- | ---------------- | -------- | --------------------------------------------------------------- |
| 1   | **Requirements** | Yes      | At least one feature/flow. Missing → ask.                       |
| 2   | **UI plan**      | No       | `plan-ui` element list / designs, if available. Never required. |
| 3   | **BE plan**      | No       | Endpoints/contracts to wire to. Use if provided.                |
| 4   | **Domain plan**  | No       | Domain models/events. Use if provided.                          |
| 5   | **Output path**  | No       | Provided → write file. Absent → return plan in chat.            |

## SOURCE RULES

- Use prompt + explicitly named files only.
- No scan/exploration (`glob`, `grep`, dir walk, codebase search).
- Plan against the reference layering; do not inspect the codebase to infer it.

## REFERENCE ARCHITECTURE

Plan toward the ideal example's layering
(`apps/romantic-app/src/modules/user-profile-setup/`):

- **presentation/** — React components, `context.tsx`, `router.tsx`, `main.tsx`.
  Components read state and call the facade; no business logic in JSX.
- **core/** — `store` (atoms/computed), `handlers/` (one per action), `mediator`,
  `registry`, `facade` exposing actions + `use*` selectors to presentation.
- **integration/** — `repository` (API calls) + `mappers` (backend → domain).
- Components talk to `core` only through the facade; data crosses layers via the
  domain models and the facade interface.

## OUTPUT

Path given → write file and confirm path only. No path → return full plan in chat.

### Section 1 — View / Route Map

Each view/screen, its route, and entry conditions. One row per view.

### Section 2 — Component Tree

Per view, the component breakdown (container vs presentational), where each lives
under `presentation/`, and which facade selectors/actions it consumes. No JSX.

### Section 3 — State & Handlers (core)

- Store atoms/computed needed (state the feature tracks).
- One handler per user action (`handlers/<action>.ts`) and what it orchestrates.
- The facade surface: actions + `use*` selectors exposed to presentation.

### Section 4 — API Communication (integration)

- Repository functions (which endpoint/contract each calls).
- Mappers (backend DTO → domain model).
- Loading / error / cancellation (AbortSignal) handling per call.

### Section 5 — Notes

One line per non-obvious decision or assumption (`// Assumption: ...`).

## RULES

1. Ask all missing required inputs in one message.
2. Requirements mandatory; UI/BE/domain plans optional and never required.
3. Prompt + named files only — no codebase exploration.
4. Plan in layers: presentation / core / integration; respect the facade seam.
5. No business logic in presentation; actions go through the facade.
6. Integration owns API calls + mapping; presentation never fetches directly.
7. Structure/flow only — no real component code or Tailwind.
8. Output path given: write file. Else: chat output.
9. Requirements change → regenerate the full plan.
10. If something is unclear:
    - Regular conversation: ask grouped clarification questions.
    - Code-like snippets in output: minimal comments only where non-obvious.
