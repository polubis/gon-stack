---
ticket: none
scope: nitpick
summary: Add skills to nitpick config
why: Skills are generated like agents so one config yields rules, agents and skills
date: 2026-10-23
tags: [nitpick, config, skills]
---

- `config()` takes `skills`, same shape as `agents` (`doc`, optional `frontmatter`, no `run`)
  - Skills render to `<path>/skills/<id>/SKILL.md`, listed under `## Skill files` in the root
  - Skill ids join the `ref` union and the unique id check (`Duplicate unit id`, `Duplicate id`)
- `docs.ts` shares one builder between agents and skills
- Tests in `docs.test.ts`, `contract.test.ts`; README updated
