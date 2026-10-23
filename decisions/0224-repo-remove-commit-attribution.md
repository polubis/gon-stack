---
ticket: none
scope: repo
summary: Disable Claude commit and PR attribution
why: Hooks reject commits with trailing attribution lines
date: 2026-10-23
tags: [claude, git]
---

- `.claude/settings.json`: set `attribution.commit` and `attribution.pr` to empty strings
  - No `Claude-Session` or similar line appended to commits and PRs
