---
ticket: none
scope: parka/walkthrough
summary: Fix layout + resume regressions vs original home intro
why: The extraction broke centering and bottom-pinning, and a persisted outcome silently redirected repeat visits
date: 2026-09-14
---

- Fixed two regressions vs pre-extraction `home` screen: (1) `ProgressDots` drifted outside centered flex wrapper and `Main` root had no flex classes — content stopped centering, actions stopped pinning bottom;
  - (2) persisted `localStorage` completion read back unconditionally on `init`, silent redirect on repeat visits instead of always showing intro.
- Added `resumePersistedOutcome` (default `false`) to restore always-fresh behavior.
- Bug 1: original was one `flex-col justify-between` screen with `StepView`+`ProgressDots` nested inside a centered wrapper;
  - 0004's first cut wrapped `StepView` itself and left `ProgressDots` as a sibling outside, breaking centering/bottom-pinning.
- Fixed by moving the flex wrapper to `router.tsx` around both, `StepView` as bare fragment, `main.tsx` root flex fill/split like original.
- Bug 2: 0004's `init` restored the localStorage outcome unconditionally, so finishing once then revisiting `/` silently redirected — a regression from original always-show behavior.
- Fixed via `resumePersistedOutcome` facade/prop, default `false` (`home` omits it, never resumes); persistence still writes for future "don't show again" callers.
- Consequence: one-time tour callers opt in explicitly with `resumePersistedOutcome`.
