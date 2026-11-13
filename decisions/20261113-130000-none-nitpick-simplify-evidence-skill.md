---
ticket: none
scope: nitpick
summary: Evidence skill now makes only labeled image or trimmed video
why: Before/after, worktrees and proof-level tables made the skill heavy, dev wanted one run that shows the described change with labels.
date: 2026-11-13
tags: [evidence, skills]
---

- Two modes only: `image` (PNG, changed components boxed with numbered labels) and `video` (one webm)
- Video cuts everything before `start()` and slows CSS animations and holds inside `slow(fn)`
  - Slow done in browser via animation playback rate, Playwright ffmpeg has no concat or setpts
- Removed before/after, worktree, serve, mock backend and responsive board
- Skill text rewritten caveman style, lists instead of tables
- Worker proof step points to image or video
- Checked on polubinski-dev hero: labels match logged values, setup cut from video
