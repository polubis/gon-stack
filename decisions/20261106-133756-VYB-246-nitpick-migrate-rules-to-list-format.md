---
ticket: VYB-246
scope: nitpick
summary: Nitpick rules use list format, details moved to refs
why: Generated rule files must follow the numbered (A) list format, detail lives in references
date: 2026-11-06
---

- Built-in rules decision-log, rich-commit, supabase-error-mapping, msw-backend-mocks rewritten as "## Title" plus "1. (A)" items
  - Rule file links to a template via {{ref:key}} instead of inlining examples
- Rules carry their own refs: new optional RuleUnit.refs, merged into config refs in buildDocs
  - Same key pointing to different files = config error, same file accepted
- Templates moved to src/rules: decision-log-template.md, rich-commit-template.md (written to references/)
- Tests: rich-commit and run-edge expectations updated, new rule refs tests in docs.test.ts
- Nitpick package coverage 100% (statements, branches, functions, lines), 347 tests
