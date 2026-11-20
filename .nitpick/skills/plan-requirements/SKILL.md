---
name: plan-requirements
description: Turn raw feature input into a requirements doc in the standard template. Trigger on "plan requirements", "standardize requirements", "make feature plan", or "prepare final feature doc".
---

Planning only. No implementation.

## Input

- Source: user prompt and/or files user names. Missing → ask once, stop.
- Output dir: write file there. None → reply in chat.
- No codebase scan. No invented scope. Unknown fact → ask, group questions in one message.

## File name

`{n}-{kebab-name}.md`. `n` = next free number in dir. Example: `1-tokens.md`, `2-themes.md`.

## Template

```markdown
# {{feature_name}}

{{one sentence: user-visible outcome}}

## Terms

- **[term_one]** - {{definition only, no rules}}. e.g. `{{example}}`
- **[term_two]** - {{definition}}

## Requirements

### {{area}}

- **{{AREA}}-1** MUST {{testable behavior using [term_one]}}. `<type:value>`
  - 1A. {{sub_point}}
  - 1B. {{sub_point}}
- **{{AREA}}-2** SHOULD {{behavior}}. Verify: {{how}}
```

## Rules

1. One home per fact. Term = definition. Requirement = behavior. Never restate.
2. Terms snake_case, used as `[term_name]`, all defined.
3. Requirement ID = `{AREA}-{n}`, area word 3-4 letters uppercase.
4. Every requirement testable. Add `Verify:` when check not obvious. No `etc`, `various`.
5. Checkable values inline as `<type:value>` on owning requirement only.
6. Sub-points = nested list `  - 1A. text`. Max 2 levels.
7. No placeholders left.
