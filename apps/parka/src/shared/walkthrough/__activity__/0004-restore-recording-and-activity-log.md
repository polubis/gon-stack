---
id: 0004
document: 0004-restore-recording-and-activity-log.md
module: shared/walkthrough
decision_ref: __decision__/0004-activity-log-convention.md
status: completed
---

# 0004 — restore deleted recording; add `__activity__` convention

**Progress**: completed, two tasks. (a) `walkthrough-fix.webm` removed from repo root after 0002; re-ran same recording script against current post-0002/0003 build, re-saved to repo root. (b) added this `__activity__` directory — per-task files, one per completed `__decision__` entry, cross-linked via `decision_ref`.

**Time**: recording re-run single scripted pass (fixed `waitForTimeout` in script, no manual iteration); output mtime `15:11` local. Writing four `__activity__` files + `__decision__` convention entry not separately timestamped.

**Cost**: not tracked — see 0001.
