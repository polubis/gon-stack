---
id: 0004
document: 0004-activity-log-convention.md
module: shared/walkthrough
status: accepted
---

# 0004 — `__activity__` dir: progress/cost/time per task

Ask: track progress/cost/time per task in `__activity__`, proper data not vibes.

Design: one file per completed task, same id/numbering as matching `__decision__` entry (cross-linked both ways: `decision_ref` frontmatter here, task file lists what shipped). Three fields always present:

- **Progress** — what shipped, one paragraph, status (`completed` / `in-progress` / `blocked`).
- **Time** — real timestamps only, from tool output this session (vitest "Start at", `astro check` timestamp line, file mtimes, UTC in Playwright MCP snapshot filenames). Never guessed/rounded duration presented as measured. Where no timestamp for sub-phase (e.g. reasoning before first tool call), say so instead of inventing one.
- **Cost** — checked first whether real per-task token/dollar cost obtainable here. It is not: `<total_tokens>` in system reminders is coarse remaining-budget figure, observed to increase between some turns (not monotonic per-task meter), so cannot back out per-task cost. Every activity file says so explicitly, points here rather than repeating reasoning, never reports fabricated number.

Why not fold into `__decision__`: different purpose. `__decision__` argues why choice was made, for another LLM picking up module. `__activity__` records what happened and when, for progress/cost tracking — no argumentation, observed data only. Separate means neither file does both jobs.

Consequence: every future task gets one `__decision__` entry (if changed something worth arguing for) and one matching `__activity__` entry (always, even trivial — see 0004's own activity file). Other modules adopting template copy both directories together, not just `__decision__`.
