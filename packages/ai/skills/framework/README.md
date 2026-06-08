# Framework — the ideal-example + clone workflow

> Companion to `article.md` (§5–§6). Code is the documentation. Keep markdown
> minimal; version and hash the few docs that describe code; maintain hand-crafted
> **ideal examples**; generate everything else from them.

Most AI workflows drown the repo in markdown that goes stale the moment it's
written. This framework inverts that: one well-crafted module per "type" of
feature acts as the source of truth, a single `AGENTS.md` per ideal example
captures its direction and conventions, those docs are content-hashed so drift is
caught in CI, and new work is **cloned** from the example against fresh
requirements.

## The flow

```
requirements  →  plan-be / plan-db / plan-domain / plan-fe  →  define seams (facades)
              →  parallel implementation (clone / do-ui)     →  integration + tests
              →  verify + iterate                            →  hashy (stamp docs)
```

- **a) Requirements** — one maintained markdown per feature (goal, scope, rules,
  constraints, acceptance criteria). See
  `apps/romantic-app/src/modules/gaming/docs/requirements/feature.md`.
- **b) Ideal example** — a hand-crafted module + an `AGENTS.md` describing its
  architecture and conventions (general direction, not line-level detail). The
  canonical example is
  `apps/romantic-app/src/modules/user-profile-setup/` (and its `AGENTS.md`).
- **c) Implementation** — `clone` reads the requirements + the ideal example's
  `AGENTS.md` and produces a new feature in the same style (e.g. the `chat-2`
  module was cloned from `user-profile-setup`).

For large features, `feature-workflow` sequences the planning + implementation
stages with a human checkpoint at each, rather than one expensive one-shot.

## Skill catalog (`skills/`)

| Skill               | Kind      | Purpose                                                          |
| ------------------- | --------- | ---------------------------------------------------------------- |
| `plan-requirements` | planning  | Normalize raw requirements into the standard feature doc.        |
| `plan-be`           | planning  | Backend endpoints/procedures + Zod `in`/`out` contracts.         |
| `plan-db`           | planning  | Schema, migrations, relations, RLS.                              |
| `plan-domain`       | planning  | Pure domain models (`models.ts`) + events (`events.ts`).         |
| `plan-ui`           | planning  | Graphic → flat element list with behaviors/variants.             |
| `plan-fe`           | planning  | Frontend architecture: views, components, state, API calls.      |
| `do-ui`             | doing     | Graphic → pixel-perfect Tailwind component.                      |
| `clone`             | doing     | Implement requirements in an ideal example's exact style.        |
| `document-module`   | doing     | Scan a module → write its `AGENTS.md` → stamp with `hashy`.      |
| `feature-workflow`  | orchestr. | Drive a feature through all stages by invoking the above.        |
| `hashy`             | tooling   | Stamp/verify a doc's version+hash against the code it describes. |

Planning skills are planning-only (output a plan; write a file only when given a
path). Doing skills write code. `document-module` is the only skill that scans
the codebase — that is its purpose.

## Versioning + hash gate (`@repo/hashy`)

Docs that describe code (`AGENTS.md`) carry `version` + `hash` frontmatter
generated from the module's files:

```yaml
---
version: 1.0
hash: 8d5f… (generated from the module's files)
---
```

- Stamp/refresh: `node packages/hashy/dist/cli.js <module-dir> <doc>` (or the
  `/hashy` skill). Minor version bumps when the hash changes.
- Verify all documented modules: `node packages/hashy/dist/cli.js --manifest hashy.modules.txt`.
- CI runs that manifest check in `.github/workflows/pr-ci.yml` (`hash-check` job),
  so a stale `AGENTS.md` fails the PR. Register new docs in `hashy.modules.txt`.

See `packages/hashy/README.md` for CLI details.

## Why this architecture

The modules under `apps/romantic-app/src/modules/` share one layered shape
(domain / core / integration / presentation, separated by TS interfaces and a
facade). Because layers are isolated and swappable, an agent fixing a bug or
adding a test stays consistent with the surrounding module by default, and clones
of an ideal example reproduce the whole stack predictably. Consistent, isolated
modules are what make the automation in §6 of the article viable.

## Design notes

See `design.md` for the rough phase sketch this framework grew from
(orchestrator, research, requirements, strategic/tactical architect, testing, db,
backend, frontend, security, ui/ux, cost). The skills above implement the slices
that are live today; the rest is roadmap.
