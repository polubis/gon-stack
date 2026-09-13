---
name: document-module
description: Scan an ideal-example module and write an AGENTS.md describing its architecture rules and code conventions, with links and a hashy-stamped version. Trigger on "document module", "create AGENTS.md", "describe conventions", "scan module and list rules", "make ideal-example doc". This is the step-b generator for ideal examples.
deps:
  hashy_skill: ../hashy/SKILL.md
---

## ROLE

Scan a module that is meant to be an ideal example, observe its architecture and
code conventions, and write a concise `AGENTS.md` into that module's directory.
The doc describes the general direction and style — not every implementation
detail. It exists so `clone` can reproduce the module's style elsewhere.

This is the **one** skill allowed to scan the codebase — scanning the target
module is its entire purpose.

## INPUTS

Check before working. Missing required → ask once, then continue.

| #   | Input          | Required | Rule                                                |
| --- | -------------- | -------- | --------------------------------------------------- |
| 1   | **Module dir** | Yes      | The ideal-example directory to scan. Missing → ask. |
| 2   | **Doc name**   | No       | Output markdown name. Default `AGENTS.md`.          |

## SCOPE RULES

- Scan only the given module directory (glob/read within it is expected).
- Describe the **general** direction and style; do not transcribe code.
- Write the result **into the directory you scanned**.
- Keep it short — this replaces sprawling markdown, it does not recreate it.

## FLOW

1. Resolve module dir + doc name (default `AGENTS.md`).
2. Scan the module top-down. Identify:
   - **Architecture** — the layers/folders and each one's responsibility
     (e.g. `domain/` pure models + events, `core/` state + handlers,
     `integration/` mapping backend models to domain, `presentation/` UI).
   - **Code conventions** — concrete, observed rules (e.g. always `const`, always
     arrow functions, branded types, `$`-prefixed atoms, named exports only).
3. Write `AGENTS.md` in the scanned directory using OUTPUT SHAPE.
4. Stamp version + hash once on this first scan: invoke the `/hashy` skill on the
   module dir + doc name (see `deps.hashy_skill`). Do this once at first creation.
5. Add the module to `hashy.modules.txt` (repo root) if not already listed.
6. Present the rules to the user and iterate to "perfection" on confirmation or
   rejection. Re-stamp via `/hashy` only after content changes are accepted.

## OUTPUT SHAPE

`AGENTS.md` written into the scanned directory:

```md
<!-- frontmatter version/hash added by /hashy -->

# <Module Name>

<One-paragraph purpose of this module as an ideal example.>

## Architecture

1. "<layer>" — <responsibility>
2. "<layer>" — <responsibility>

## Code

1. <observed convention>
2. <observed convention>

## References

- [<concept>](relative/path) — read only if the idea above is unclear.
```

Rules for the doc:

- `Architecture` lists each layer/folder and its single responsibility.
- `Code` lists concrete, checkable conventions actually present in the module.
- `References` links files that explain a concept; `clone` opens them only when
  confused, so keep them few and purposeful.
- General direction over detail; no copied code blocks.

## RULES

1. Scan only the target module; write the doc inside it.
2. Describe the general style/architecture, not line-level detail.
3. List only conventions you actually observed in the module.
4. Stamp version/hash via `/hashy` once on first scan; re-stamp after accepted edits.
5. Register the module in `hashy.modules.txt` so CI verifies it.
6. Iterate with the user until the rules are correct; do not finalize unilaterally.
7. Keep the doc minimal — fewer, denser markdown files is the goal.
