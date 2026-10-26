---
ticket: none
scope: repo
summary: Add editorconfig with LF and document CRLF phantom diff fix
why: Windows tools write CRLF; git shows empty-diff M entries because lint-staged and prettier skip non-code files
date: 2026-10-26
tags: [git, eol, editorconfig]
---

- `.editorconfig` with `end_of_line = lf`
  - Editors stop creating CRLF; AI Write tool ignores it
- Cause of phantom ` M`
  - `.gitattributes` has `text=auto eol=lf`, so index stays LF while working tree keeps CRLF
  - `git add` of an EOL-only change is a no-op, so lint-staged never sees these files
- Fix when it appears
  - `git add --renormalize .` stages nothing and clears the entries
  - Custom EOL script and lint-staged entry rejected as overkill
