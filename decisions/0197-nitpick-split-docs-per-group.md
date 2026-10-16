---
ticket: none
scope: nitpick
summary: Split generated docs into one file per rule group
why: Match .claude/rules layout so .ai output is identical per group file and config stays small
date: 2026-10-16
tags: [nitpick, docs, rules]
---

- `buildDocs` writes `<path>/rules/<group>.md` per group: `## Title` + numbered `N. (A) text` list in config order, like `.claude/rules/*.md`
  - File instruction rules link as `[id](id.md)` from the group file
  - Refs in rule and group texts resolve relative to the file that holds them
- Root file keeps header, AODI legend, intro, ungrouped rules and `## Rule files` index
- Removed `docs.importances` and importance sections, the tag is inline now
- Default group title is the capitalized name; config drops `Rules for X` titles and group intro texts
- Config errors for a group named like a rule id file or with unsafe characters
