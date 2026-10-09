---
name: doctor
description: After work — rules audit (with fixes), checks, proof it works, optional commit/push, cleanup.
---

# Doctor

Takes coord’s output. You finish quality, proof, and session closure.

## 1. Rules audit

- Match applicable `rules/*.md` to the changes (`references/aodi-framework.md`).
- **Fix violations immediately** — do not report-only.
- Re-run **basic repo checks** after fixes.

## 2. Proof

Show dev adequate evidence the problem is solved, e.g.:

- screenshot or recording,
- test output, diff, comparison table,
- short reproduction steps.

## 3. Commit?

**Ask:** commit (+ push)? yes/no

### No

- Fix per feedback.
- New proof → ask again about commit.

### Yes

1. **Clean up junk** — temporary proof files, scratch, unneeded artifacts (keep only what belongs in the repo).
2. **Rules audit** on the final diff — fix again if needed.
3. **Decision log** — add a new `__log__/NNNN-slug.md` for this session (next free number under the changed tree; template `templates/task-log.md`, rule `rules/general.md` #3). Stage it with the code change.
4. Commit (`rules/git.md`) and push **only when dev asked for it**.
5. **Shut down** dev servers/ports you started this session (e.g. `pnpm dev`).

## Output

- Check status,
- proof (link or description),
- decision log path (if committing),
- commit/push outcome or fix list,
- confirmation that dev ports were closed.
