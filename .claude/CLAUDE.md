# gon-stack `.claude`

This file + `rules/`, `skills/`, `references/`, `templates/` guide agents in **gon-stack**.

## Prerequisites

Always check `references/aodi-framework.md` and `rules/general.md` before any task and force rules.

## Ecosystem

### Structure

```md
`rules/` -> rules to apply during work
`skills/` -> skills
`references/` -> knowledge
`templates/` -> templates
`agents/` -> agent personas
```

### Rules

| Path               | What                                 |
| ------------------ | ------------------------------------ |
| `rules/general.md` | Standing coding/style/test/AI policy |

### References

| Path                                  | What                                                      |
| ------------------------------------- | --------------------------------------------------------- |
| `references/aodi-framework.md`        | A/O/D/I tag legend for `rules/*.md`                       |
| `references/frontend-architecture.md` | Module layout: presentation / core / domain / integration |

### Templates

| Path                        | What                          |
| --------------------------- | ----------------------------- |
| `templates/task-log.md`     | Session end log entry         |
| `templates/feature.md`      | Feature requirements scaffold |
| `templates/AGENTS.md`       | Module agent doc scaffold     |
| `templates/SKILL.md`        | Skill scaffold                |
| `templates/power_prompt.md` | Power prompt scaffold         |

### Agents

| Path                               | What                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| [agents/coord.md](agents/coord.md) | Orchestrator: Planner → specialists → verifiers → dev report |

### Worktrees

| Path         | What                          |
| ------------ | ----------------------------- |
| `worktrees/` | Scratch notes / worktree docs |

### Skills

| Skill                                                                                | Does                                    | When                    |
| ------------------------------------------------------------------------------------ | --------------------------------------- | ----------------------- |
| [caveman](skills/caveman/SKILL.md)                                                   | Cut fluff ~75%; keep tech exact         | Markdown / `/caveman`   |
| [clarify](skills/clarify/SKILL.md)                                                   | Vague ask → airtight spec               | Req unclear             |
| [sloth](skills/sloth/SKILL.md)                                                       | One tiny change + confirm               | `/sloth`, risky blast   |
| [plan-requirements](skills/plan-requirements/SKILL.md)                               | Raw → standard feature.md               | Plan requirements       |
| [ux-ui-designer](skills/ux-ui-designer/SKILL.md)                                     | MVP → `ux-ui.md`                        | Design tokens/views     |
| [plan-ui](skills/plan-ui/SKILL.md)                                                   | Graphic → element list (no code)        | Analyse mockup          |
| [plan-db](skills/plan-db/SKILL.md)                                                   | Schema + indexes/security/migrations    | Design DB               |
| [plan-be](skills/plan-be/SKILL.md)                                                   | REST/RPC + Zod in/out                   | Plan APIs               |
| [plan-domain](skills/plan-domain/SKILL.md)                                           | Pure TS domain types + events           | Domain layer            |
| [plan-fe](skills/plan-fe/SKILL.md)                                                   | Views/core/integration plan             | FE architecture         |
| [supabase-mate](skills/supabase-mate/SKILL.md)                                       | Supabase design + approval gates        | Schema/RLS/RPC          |
| [feature-workflow](skills/feature-workflow/SKILL.md)                                 | Orchestrate plan → impl skills          | Full epic               |
| [clone](skills/clone/SKILL.md)                                                       | Impl in ideal-example style             | "clone X, build Y"      |
| [do-ui](skills/do-ui/SKILL.md)                                                       | Graphic → pixel-perfect Tailwind        | Pixel-perfect UI        |
| [document-module](skills/document-module/SKILL.md)                                   | Module → `AGENTS.md` + hashy            | Ideal-example docs      |
| [hashy](skills/hashy/SKILL.md)                                                       | Stamp/check doc hash vs code            | After AGENTS.md         |
| [async-implement](skills/async-implement/SKILL.md)                                   | TODO.md → parallel worktree agents      | Multi-task parallel     |
| [ui-component-craft](skills/ui-component-craft/SKILL.md)                             | Req gate → pure UI components           | Craft components        |
| [react-best-practices](skills/react-best-practices/SKILL.md)                         | React/Tailwind/Radix rules              | Write/review React UI   |
| [supabase-postgres-best-practices](skills/supabase-postgres-best-practices/SKILL.md) | Postgres perf rules                     | SQL/schema tune         |
| [black-box-tester](skills/black-box-tester/SKILL.md)                                 | Plan → black-box tests only             | Tests from requirements |
| [e2e-via-commands](skills/e2e-via-commands/SKILL.md)                                 | E2E via step interpreter                | Extend e2e path         |
| [check-html](skills/check-html/SKILL.md)                                             | a11y audit HTML/URL                     | Check accessibility     |
| [witch-doctor](skills/witch-doctor/SKILL.md)                                         | Score module quality                    | Audit/review codebase   |
| [git-commit](skills/git-commit/SKILL.md)                                             | Conventional commit + approval; no push | User asks commit        |
| [copyman](skills/copyman/SKILL.md)                                                   | Landing/pricing conversion copy         | Marketing copy          |
| [posty](skills/posty/SKILL.md)                                                       | Batch polish posts (`---` split)        | Post grammar/typo       |
| [polaczek](skills/polaczek/SKILL.md)                                                 | Polish lang + typography                | Polish text fix         |
| [loop-article-web](skills/loop-article-web/SKILL.md)                                 | One lang template per run               | Article loop            |
| [do-memo](skills/do-memo/SKILL.md)                                                   | Concept → use case → example            | Flashcard / memo        |
| [mti](skills/mti/SKILL.md)                                                           | Interview notes → scored report         | Tech interview write-up |
