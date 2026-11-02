---
ticket: none
scope: claude
summary: Rename frontend architecture ref to eda-architecture
why: Prior name implied generic frontend only; doc already centered EDA + layered modules
date: 2026-09-15
---

- Replaced `.claude/references/frontend-architecture.md` with `eda-architecture.md` — same scalable frontend layout content (root dirs, per-module layers, example pointer), plus reference-template frontmatter (`title`, `impact`
  - `impactDescription`, `tags`).
- Body kept as guide list; no incorrect/correct template sections.
- Single `eda-architecture` reference aligns filename with content and matches `.claude/templates/reference.md` metadata shape for future reference indexing.
