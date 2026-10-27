---
ticket: none
scope: claude
summary: Rework evidence skill into leveled proof with runnable script
why: Video proof was slow and unpredictable; 13 prose steps replaced by cheapest-proof table and script
date: 2026-10-27
tags: [claude, skills, evidence]
---

- `SKILL.md` shortened, caveman style
  - Proof level table: test, shot, single video, sequential before-after, responsive board
  - Budget 1-3 scenes; side-by-side iframe only on explicit dev request
- New generic `evidence.mjs` with no repo specifics
  - Urls, serve cmds, out dir, tz, locale come via args
  - Modes: single, before-after, shot, responsive
  - Mark/unmark, title cards, assertion log, key frames, cleanup in `finally`
- Responsive mode: one PNG board, shot per `--viewports` entry labeled by width, list taken from `rules/ui.md`
- Backend: prefer real dev backend; `context.route` mock only when unreachable, logged
- `coord` removed, `worker` now the single agent: picks proof level before first edit
  - `CLAUDE.md` and `factory` delegate to `worker`
