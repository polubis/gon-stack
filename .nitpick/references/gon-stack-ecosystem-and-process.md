# gon-stack ecosystem and process

Detail for `factory` agent. Ticket work end to end.

## Ecosystem

- Monorepo: `apps/*`, `packages/*` (turbo + pnpm).
- Local CI/CD: on commit (hooks: turbo tests + e2e, slow, minutes) and on PR.
- Commit/push: run in background, wait for finish.
- Prefer real local env (real db/backend) over mocks.
- DB: `pnpm db:start|stop|reset|gen-types` (turbo, per app, f.e. `apps/parka`). After migration change run `db:reset` then `db:gen-types` (regenerates `db-schema.ts`).
- gh CLI: `"C:\Program Files\GitHub CLI\gh.exe"`.
- Tickets live in Parka (MCP). See Ticket.

## Ticket

- Id passed -> read via MCP (`list_tasks`/`get_task`).
- Only category `Automatyzacja` (or similar tag). Else stop, ask dev.
- All MCP calls via cheap subagent (haiku). Never main model.
- Status per stage: `open` / `in_progress` / `done` (MCP supports only these; read allowed values from MCP response).
- No comment tool now. Stage log = text/plain attachment via `add_task_attachment` (max 5 files/task, so keep one `stage-log.txt`, re-upload, delete old via `delete_task_attachment`). When comment tool exists, comment instead.
- Every stage has a log when key given.
- Spotted bug/weirdness -> new backlog ticket (`create_task`), category `Automatyzacja` if exists, with description (where, repro, expected).
- PR link goes to ticket. PR text and commit text never mention Parka/MCP.

## Stage-log template

```
Stage: <A|B|C|D> <name>
Status: <open|in_progress|done>
Done:
- <what>
Proof:
- <test/output/evidence file>
Links:
- <branch/PR/files>
Problems:
- <none | issue + decision>
Next:
- <next step>
```

## Git rules

- Never work on non-main branch directly; always worktree.
- Precondition: on `main`, `git pull` done.
- Each task: fresh main, own branch, own worktree, own PR. Waves = single PR, not 5 PRs.
- Branch/worktree name contains exact ticket key (`VYB-229-short-slug`). No key -> random id.
- Always PR, after work verify PR exists (gh), link in ticket.
- Commit msg per `rich-commit`; one decision entry per `decision-log`.

## Parallelism

- Delegate for max parallelism (independent sub-tasks -> subagents).
- Shared resources (ports, supabase/db instances, migrations) tracked in temp registry/lock files (f.e. `%TEMP%/factory-locks/<resource>.lock` with owner + pid). Take before use, release + delete after.
- DB/migration tasks go last, sequential.

## Stages

### A Research, analysis, blueprint

- Code research.
- Implementation + test plan in metasyntax. Add failing unit/integ/e2e tests as fits (pyramid).
- Decide evidence: before/after needed? (see `evidence` skill). BEFORE captured now on untouched code.
- Pull main, create worktree + setup (install, env, ports from registry). Gitignored files are missing in a new worktree: copy every ignored `apps/*/.env*` (f.e. parka `.env`, romantic-app `.env.local`) from main, else e2e in commit hook fail (missing Supabase URL/key); after copy rebuild apps with `pnpm turbo build --filter=<app> --force` (turbo cache restores dist from other worktree path). Run `pnpm nitpick:sync`.
- Ticket -> `in_progress`. Log A.

### B Implementation

- Code until tests pass. Tools: playwright MCP etc.
- Before evidence: break implementation a few times on purpose; tests must fail. Restore.
- Record AFTER evidence.
- Log B.

### C Review and refactor

- Review via `doctor` subagent per project rules.
- Prepare commit msg + decision log.
- Log C.

### D Finalize

- Commit + push (background, wait). Hook fail -> apply related fixes, retry. After 3 failed attempts: `--no-verify` and report in ticket.
- Open PR (gh). PR link to ticket.
- Upload evidence to ticket: png/gif/pdf/text only, <=5MB, max 5 files. Video: convert to gif or replace by frames + log. webm not allowed.
- Send attachments to phone (mobile) if possible.
- Ticket -> `done`. Final log D.
- Cleanup: delete local evidence, worktree, release ports/locks, kill processes.

## Example run

EXAMPLE ONLY. Fictional ticket, not real.

Ticket `VYB-208`, category Automatyzacja: "Rename button `Add` to `Add task` in day view".

**A**

- haiku subagent: `get_task` VYB-208 -> category ok, status `open`; set `in_progress`.
- `git pull` on main. Worktree `VYB-208-rename-add-task-button`.
- Research: label in day view component + e2e selector + unit test.
- Plan (metasyntax): `dayView.addButton.label := "Add task"`; test: `button[name="Add task"] visible`.
- Failing unit test added. Evidence: before + after screenshot. before.png taken on untouched code.

```
Stage: A Research
Status: in_progress
Done:
- Found label in day-view header; planned rename + failing unit test
Proof:
- unit test red (name "Add task" not found); before.png
Links:
- branch VYB-208-rename-add-task-button
Problems:
- none
Next:
- implement label change
```

**B**

- Change label. Unit + e2e green.
- Break on purpose: revert label, change role, hide button -> tests red each time. Restore.
- after.png taken.

```
Stage: B Implementation
Status: in_progress
Done:
- Label renamed; unit + e2e green; 3 mutations caught by tests
Proof:
- after.png; test output green
Links:
- worktree diff
Problems:
- spotted: week view still says "Add" -> backlog ticket created
Next:
- doctor review
```

**C**

- doctor subagent: rules audit, one unused import fixed, clean.
- Commit msg `feat(parka): rename add button label in day view`; decision `0275-parka-rename-add-task-button.md`.

```
Stage: C Review
Status: in_progress
Done:
- doctor audit clean; commit msg + decision prepared
Proof:
- doctor report: 0 open violations
Links:
- decisions/0275-...
Problems:
- none
Next:
- commit, push, PR
```

**D**

- Commit in background; hook e2e fails once (flaky selector), related fix, retry passes.
- Push, `gh pr create`; PR text has no ticket-tool mentions.
- Upload before.png, after.png, stage-log.txt (3 of 5 files). Sent to phone. Status `done`. PR link in ticket.
- Cleanup: evidence dir, worktree, port lock, dev server.

```
Stage: D Finalize
Status: done
Done:
- committed (2 attempts), pushed, PR opened, evidence uploaded, cleaned up
Proof:
- PR checks; before.png, after.png
Links:
- PR <url>
Problems:
- 1 hook retry (flaky selector, fixed)
Next:
- none
```
