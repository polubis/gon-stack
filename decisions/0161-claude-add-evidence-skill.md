---
ticket: none
scope: claude
summary: Add evidence skill for before/after video proof
why: Dev wants UI changes proven by video with highlighted spots, reproducible by any agent
date: 2026-10-11
tags: [skills, video, proof]
---

- New `.claude/skills/evidence/SKILL.md`: step-by-step recipe for Playwright-recorded proof video
  - Before/after side by side (git worktree of HEAD vs working tree), injected highlight boxes and captions, title cards
  - Single-run variant when there is no before
- Permanent reference: parka date unification video and its recording script stored in `skills/evidence/references/`
- Registered in `CLAUDE.md` skills table
