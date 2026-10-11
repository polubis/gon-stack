Path: `decisions/{NNNN}-{scope-prefix}-{verb}-{object}.md`. `NNNN` = next free number.

```md
---
ticket: none
scope: {scope}
summary: {oneLineTitle}
why: {oneLineReason}
date: {YYYY-MM-DD}
supersedes: {NNNN}
tags: [{kebab-tag}]
---

- {change}
  - {nested detail}
```

- required: `ticket`, `scope`, `summary`, `why`. Optional: `date`, `supersedes`, `tags`
- optional metrics, only if known from the conversation, skip otherwise: `models`, `inputTokens`, `outTokens`, `cost`, `workTimeInMinutes`
- body: only nested `- ` list, no heading, prose or code fence
- bounds and allowed scopes: `packages/nitpick/src/rules/decision-entry.md`, `.nitpick/config.ts`
