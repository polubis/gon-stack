---
id: 0002
document: 0002-fix-layout-and-resume-regressions.md
module: shared/walkthrough
decision_ref: __decision__/0002-fix-layout-and-resume-regressions.md
status: completed
---

# 0002 — fix layout + resume regressions

**Progress**: completed. Fixed two regressions vs pre-extraction `home` screen: (1) `ProgressDots` drifted outside centered flex wrapper and `Main` root had no flex classes — content stopped centering, actions stopped pinning bottom; (2) persisted `localStorage` completion read back unconditionally on `init`, silent redirect on repeat visits instead of always showing intro. Added `resumePersistedOutcome` (default `false`) to restore always-fresh behavior. Re-verified with updated unit tests, live browser click-through, re-recorded `walkthrough-fix.webm` at repo root.

**Time** (local machine clock, ~UTC+2 per 0001):

- Green unit-test run after fix: `14:25:13` (6 tests, 2.57s).
- Browser re-verification snapshot: `12:25:59Z` UTC (matches `14:25:xx` local).
- Recording output (`walkthrough-fix.webm`) mtime: `14:29` local.

Task spanned roughly local `14:25`–`14:29` (~4 min) for fix-verify-record loop in tool output. Reasoning time before fix not separately timestamped.

**Cost**: not tracked — see 0001 (`<total_tokens>` not usable per-task cost proxy).
