# 0007 - Split `.claude` rules by domain

```json
{
  "status": "done"
}
```

Split monolithic `rules/general.md` into domain files: `coding.md`, `typescript.md`, `react.md`, `astro.md`, `testing.md`, `git.md`, `security.md`, `architecture.md`, `styling.md`, `ux.md`. Keep `general.md` for communication, AI, and session logging only. Export order lives in `coding.md`; TypeScript strictness in `typescript.md`. `architecture.md` points to `references/frontend-architecture.md`. New `ux.md`: error display pattern, skeletons, spinners, optimistic UI/toasts. Update `CLAUDE.md` prerequisites to `rules/*.md` and index all rule paths in the Rules table.

Single rules file mixed always-on policy with stack-specific guidance; hard to scan and load selectively. Consequence: agents read AODI legend first, then apply only the rule files relevant to the task (React work → `react.md` + `styling.md` + `ux.md`, etc.); `general.md` stays the always-on baseline.
