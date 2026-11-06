---
ticket: VYB-246
scope: nitpick
summary: Listed flag on rule and ref overrides hidden toc list in root doc
why: toc hides whole section; some rules/refs must still show in root
date: 2026-11-06
---

- `RuleUnit.listed` and ref object form `{ file, listed }` (`RefSource`)
- Hidden `toc.rules` still lists group files that hold a listed rule
- Hidden `toc.refs` still lists listed refs
- Default `toc` (unset) unchanged: all listed
- `unlisted` untouched: hides rule line from its group file only
- Tests: listed ref and listed rule show under hidden toc
