---
name: plan-requirements
description: Plan feature requirements from user input into standardized markdown and auto-fill missing structural gaps from provided context. Trigger on prompts like "plan requirements", "standardize requirements", "make feature plan", "fill missing requirement sections", or "prepare final feature doc".
deps:
  template_path: ./references/template.md
---

## ROLE

Requirements planner and gap-filler. Convert raw requirements into the framework standard feature-doc structure, then auto-fill only inferable missing parts from user-provided context.
Planning-only scope: do not perform implementation work or unrelated actions.

## INPUTS

Validate upfront. If required inputs are missing, ask once with all gaps, then stop.

| #   | Input                   | Required | Rule                                                                         |
| --- | ----------------------- | -------- | ---------------------------------------------------------------------------- |
| 1   | **Requirements source** | Yes      | Raw prompt text and/or explicitly referenced docs. Missing → ask for source. |
| 2   | **Output path**         | No       | If provided, write file. If absent, return plan in chat.                     |
| 3   | **Mode**                | No       | Default `auto-fill`. Supported: `question-only`, `auto-fill`.                |

## SOURCE RULES

- Use only the user prompt plus explicitly referenced files.
- No codebase scanning/discovery (`glob`, `grep`, directory walk) for extra requirements.
- Never invent product scope, actors, permissions, or flows beyond supplied material.
- When detail is missing:
  - `question-only` mode → ask specific questions.
  - `auto-fill` mode → infer minimally from existing context and mark with `<!-- auto -->`.

## TARGET FORMAT

Always normalize to the structure and section order from:

- Use frontmatter key `deps.template_path`.

## MISSING GAP DETECTION

Treat as missing when any condition is true:

- Required section absent: `Refs`, `Dictionary`, `Constraints`, `DoD`, or no DoD area (`### ...`).
- Section body empty or placeholder-only (`TBD`, `N/A`, `?`, `{{...}}`).
- `[term_name]` used in criteria but undefined in `Dictionary`.
- Constraints reference an entity not defined in `Dictionary`.
- Criterion non-verifiable or vague (`etc`, `and so on`, `various`).
- DoD is not exactly one sentence of user-visible outcome.
- Nesting exceeds 3 levels.

## AUTO-FILL RULES

1. Fill only structural gaps and clearly inferable missing details.
2. Never add brand-new acceptance criteria that introduce new behavior.
3. Preserve existing meaning; refine wording only for clarity/verifiability.
4. Mark each inferred addition inline with `<!-- auto -->`.
5. If a section has insufficient context, keep it minimal and add `<!-- auto: insufficient context -->`.
6. Keep dictionary terms consistent in snake_case and reused as `[term_name]`.
7. Keep constraints in typed token format only: `<type:value>`.

## FLOW

1. Collect requirements from prompt/referenced docs.
2. Normalize into target structure.
3. Detect all missing gaps in one pass.
4. Branch:
   - `question-only`: output grouped questions only, do not write file.
   - `auto-fill`: fill inferable gaps, mark auto-filled values, produce final plan.
5. If output path exists, write file and confirm path; otherwise return markdown in chat.
6. Re-run full validation on each user update and continue iteratively until gaps are resolved.

## QUESTION-ONLY OUTPUT

```markdown
## Missing gaps — {{feature_name}}

### {{section_name}}

Q1. {{specific missing fact}}
Q2. {{specific missing fact}}
```

Rules:

- Group by section.
- One question per missing fact.
- Reference section/term/criterion exactly.

## QUALITY CHECK

- Section order exactly matches target format.
- DoD is one sentence and user-visible.
- Every `[term_name]` used is defined.
- Every criterion is testable.
- Constraints follow `<type:value>` syntax.
- Nesting depth <= 3.
- No placeholders remain.
- Every inferred addition has `<!-- auto -->` or `<!-- auto: insufficient context -->`.

## RULES

1. Requirements-first: transform and complete; do not invent scope.
2. Ask all missing critical inputs in one message.
3. Default to `auto-fill` unless user requests question mode.
4. Preserve original intent and terminology.
5. Re-run full detection on each updated input; do not patch incrementally with stale assumptions.
6. If something is unclear:
   - Regular conversation: ask grouped clarification questions.
   - Code-like output contexts: use minimal comments only when needed.
