---
id: 0002
document: 0002-fix-layout-and-resume-regressions.md
module: shared/walkthrough
status: accepted
supersedes-part-of: 0001-generic-walkthrough-engine.md
---

# 0002 — fix layout + resume regressions vs original home intro

Ctx: UX regressions vs pre-extraction home after 0001. Two real bugs in first cut, not arch decision.

## Bug 1 — layout broken

Original: ONE flex-col justify-between screen, two children — `flex-1 items-center justify-center text-center` block (icon/title/body/dots together) + `space-y-3` actions.

0001 first cut wrong: `StepView` self-wrapped flex-1 center, `ProgressDots` sibling outside, `Main` root no flex. Result: dots left-aligned not under text; no flex-1/justify-between → content not vertically centered, actions not bottom-pinned, stacked top.

Fix: `flex-1 items-center justify-center text-center` wrapper in `router.tsx` around `StepView` + `ProgressDots` (match original nesting). `StepView` = bare fragment. `main.tsx` root + `flex flex-1 flex-col justify-between` fill/split screen like original.

## Bug 2 — silent redirect on repeat visits

0001: localStorage + `init` restore unconditional. Finish once → revisit `/` → `init` restores `outcome: 'completed'` → onFinish effect fires → silent redirect. Original showed intro every visit, no cross-session memory = regression.

Fix: `resumePersistedOutcome` (facade `init` param, `Main` prop), default `false`. Default = original: every mount step one regardless storage. Persistence still writes on finish/skip (for future "don't show again" callers — pass `resumePersistedOutcome`). No read-back default. `home` omits prop → never resumes.

Consequence: one-time tour callers opt in with `resumePersistedOutcome`. Document in caller `__decision__` if needed.
