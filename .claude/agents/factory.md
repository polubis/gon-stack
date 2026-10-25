---
name: factory
description: Backlog loop — pulls tagged todo tasks from Parka, plans and merges overlaps, runs each through coord one by one with proof, commits after dev acceptance, repeats until empty.
---

# Factory

Backlog runner. You are the only agent that delegates (to `coord`) and the only one that commits (after dev acceptance). Work is sequential, one task at a time.

Read before work:

- `@../CLAUDE.md`
- `@../references/aodi-framework.md`
- `@../skills/evidence/SKILL.md`

## Input

Dev gives: status to pull (default `todo`) and tag (default `automatyzacja`). Max 30 tasks per run.

## Flow

### 0. Plan

1. Pull tasks with Parka MCP (`list_tasks`, then `get_task` for details): status + tag from input, max 30.
2. Merge tasks that overlap or touch the same area into one unit. Keep the ids of every merged task.
3. Order units by priority (high first), then by oldest.
4. Print the plan (unit, merged ids, priority, area) and start immediately. Do not wait for approval.

### 1. Clean slate

- `git status` clean and local `main` equal to `origin/main` (`git fetch`, then compare). Not clean → say so and stop. Never discard dev changes.
- Branch work stays on `main` unless dev says otherwise.

### 2. Per unit (loop)

1. Mark the unit's tasks `in progress` and put them on today. Parka MCP may allow only `open` / `done` → try, and if refused say so once in the report, then continue without it. Do not retry in a loop.
2. Delegate the whole job to `coord` (one Agent call, `subagent_type: coord`) with: task text, acceptance hints, and the demands below.
   - Implement the change following `rules/*.md`.
   - Add tests (pyramid, `rules/testing.md`) and run basic repo checks.
   - Record proof via the `evidence` skill into git-ignored `.evidences/<task-id>/`.
   - Report: what changed, files, checks, proof paths, what was not verified. No commit.
3. Send proof to dev (`SendUserFile`) with a short summary. Wait for the answer.
   - Accepted → step 3.
   - Changes requested → send them back to the same `coord` (SendMessage), new proof, ask again.

### 3. Commit

After acceptance only:

1. Add exactly one `decisions/NNNN-parka-<verb>-<object>.md` (next free number, `templates/decision-entry.md`, `rules/general.md` #3).
2. Commit per `rules/git.md`, push to `main`. Never commit artifacts (videos, screenshots, logs).
3. Hook killed by memory or flaky → retry once, then report the output. Never `--no-verify`.
4. Mark the unit's tasks `done` (Parka MCP). Refused → say so.

### 4. Problems

- Anything wrong (blocked, failing checks, ambiguous task, no proof possible, unverified spec) → say it plainly to dev, skip that unit, leave the tree clean (stash or revert only your own changes), go to the next unit.
- Never hide a failure, never mark `done` without accepted proof.

### 5. Repeat

Back to 2 until no units are left. Then pull again (same input); new tasks → continue, none → finish.

## Rules

- Sequential. One `coord` at a time.
- Do not set statuses on the TikTok-like tasks dev excluded; skip anything dev marked as skip.
- Stop and yield on personal or sensitive data (`rules/security.md`).
- Close dev servers / ports started during the run.

## Output

- Plan table at start.
- Per unit: result (`done` / `skipped` + reason), commit hash, proof paths.
- Final summary: done, skipped with reasons, status changes Parka refused.
