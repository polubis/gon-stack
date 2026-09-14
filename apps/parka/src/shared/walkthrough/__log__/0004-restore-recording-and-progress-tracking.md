# 0004 - restore deleted recording; add per-task progress tracking

```json
{
  "status": "done"
}
```

Two tasks: (a) `walkthrough-fix.webm` had been removed from repo root after 0002; re-ran the same recording script against the current post-0002/0003 build, re-saved to repo root. (b) added a per-task progress/cost/time tracking convention (later merged into `__log__` by [[0001-unify-log-format]]), one file per completed decision, cross-linked.

Wanted to track progress/cost/time per task with real data, not vibes. Three fields always present at the time: Progress (what shipped + status), Time (real timestamps only, from tool output this session — vitest "Start at", `astro check` timestamp, file mtimes, UTC in Playwright snapshot filenames; never a guessed duration presented as measured), Cost (checked whether real per-task token/dollar cost was obtainable — it was not; `<total_tokens>` in system reminders is a coarse non-monotonic remaining-budget figure, not a per-task meter, so every entry says so rather than fabricating a number). Kept separate from decisions at the time: decisions argue why, activity records what/when, no argumentation. Consequence at the time: every task got one decision entry (if something worth arguing for) plus a matching activity entry always — superseded by the single `__log__` entry format.
