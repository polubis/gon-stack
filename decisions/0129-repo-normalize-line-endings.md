---
ticket: none
scope: repo
summary: Normalize line endings to LF
why: Index is already LF; one format, no conversion, no phantom changes
date: 2026-10-09
---

- Files showed as modified after every commit with no content diff.
- Cause: `core.autocrlf=true` + prettier `endOfLine: crlf` (lint-staged rewrites staged files to CRLF) while the index holds LF; no `.gitattributes`. Stale stat info after the lint-staged restore made git report `M`.
- Fix: `.gitattributes` with `* text=auto eol=lf`, prettier `endOfLine: lf`. Local: `core.autocrlf false`.
- Also added `ui.md` rule 8: no button/input/controls text overlap.
- Decision: LF everywhere instead of CRLF everywhere.
