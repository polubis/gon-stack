---
name: feature-workflow
description: Orchestrate a full feature through staged planning and parallel implementation by sequencing the other framework skills. Trigger on "feature workflow", "run the full workflow", "implement this epic end to end", "/feature-workflow", or when a large feature must go through requirements → plans → implementation → integration → review.
deps:
  plan_requirements: ../plan-requirements/SKILL.md
  plan_be: ../plan-be/SKILL.md
  plan_db: ../plan-db/SKILL.md
  plan_domain: ../plan-domain/SKILL.md
  plan_fe: ../plan-fe/SKILL.md
  clone: ../clone/SKILL.md
  do_ui: ../do-ui/SKILL.md
  hashy: ../hashy/SKILL.md
---

## ROLE

Orchestrator for large features. Drive the work through staged planning and
layered implementation by **invoking the other framework skills** — never
re-implement what they do. Keep control at each stage; prefer iterative execution
with a human checkpoint over a single expensive one-shot.

## INPUTS

Check before starting. Missing required → list all gaps once, then continue.

| #   | Input             | Required | Rule                                                                    |
| --- | ----------------- | -------- | ----------------------------------------------------------------------- |
| 1   | **Requirements**  | Yes      | `feature.md`-style doc or epic text. Missing → run `plan-requirements`. |
| 2   | **Ideal example** | Yes      | Module/file whose style implementation mirrors. Missing → ask.          |
| 3   | **API style**     | Cond.    | `REST` or `RPC`, needed before `plan-be`. Missing → ask at that stage.  |
| 4   | **DB engine**     | Cond.    | Needed before `plan-db`. Missing → ask at that stage.                   |
| 5   | **Target module** | Yes      | Where the implementation lands. Missing → ask.                          |

## DEFINITION OF "WORKING"

Track these as the success metrics for the feature:

- Tests pass.
- The project builds.
- Functionality works manually.
- TDD scenarios are satisfied.
- Acceptance criteria are met.

## STAGES

Run sequentially unless marked parallel. Confirm at each checkpoint before
spending on the next stage.

1. **Requirements** — ensure a consistent requirements doc exists; if not, run
   `/plan-requirements` (deps.plan_requirements). Output: business goal, scope,
   business rules, constraints, acceptance criteria.
2. **Plan BE** — run `/plan-be` (deps.plan_be): endpoints/procedures, contracts.
3. **Plan DB** — run `/plan-db` (deps.plan_db): schema, migrations, relations.
4. **Plan Domain** — run `/plan-domain` (deps.plan_domain): domain models + events.
5. **Plan FE** — run `/plan-fe` (deps.plan_fe): views, components, state, API calls.
6. **Define the seams (facades)** — lock the contracts/DTOs/events/interfaces and
   the cross-layer communication rules that let layers proceed independently.
7. **Parallel implementation** — once seams are fixed, implement layers against
   them, parallel where possible:
   - backend logic, DB model, domain, and frontend each to the agreed facade;
   - use `/clone` (deps.clone) against the ideal example for code style;
   - use `/do-ui` (deps.do_ui) for pixel work from a graphic.
8. **Integration + tests** — wire layers together; run unit, integration,
   contract, and e2e tests.
9. **Verify + iterate** — run tests, check the success metrics, manual test, fix,
   repeat until the feature works.
10. **Stamp docs** — if the ideal example or its `AGENTS.md` changed, re-run
    `/hashy` (deps.hashy).

## RULES

1. Orchestrate only — delegate every stage to the owning skill; do not duplicate
   their logic here.
2. Keep a human checkpoint between stages; favor iterative control over one-shot.
3. Fix the facades/contracts before any parallel implementation begins.
4. Parallelize only layers that share a locked seam.
5. Hold the line on architecture: each layer separated by TS interfaces, swappable
   without breaking others.
6. A stage is done only when its output is usable by the next stage.
7. The feature is done only when all "working" metrics pass.
8. If something is unclear, ask grouped clarification questions before proceeding.
