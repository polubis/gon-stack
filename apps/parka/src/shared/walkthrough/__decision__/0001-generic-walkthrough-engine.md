---
id: 0001
document: 0001-generic-walkthrough-engine.md
module: shared/walkthrough
status: accepted
cloned-from: apps/romantic-app/src/modules/user-profile-setup
---

# 0001 — generic walkthrough engine

Ctx: home had inline 4-step intro. Hardcoded steps + local useState, no shared shape/reuse/persistence. Repo flat, no layers/decisions. Task: extract to shared/walkthrough, clone user-profile-setup arch.

Decision: shared module = generic engine, NOT home content. Steps via prop (`WalkthroughStep[]`), not baked in. Reason: reusable across features (settings tour, flag intro, etc). Home copy baked in = home module in shared/ label.

Layer diffs from reference:

1. No `configuration/validation.ts`. Reference = react-hook-form fields. No form here → kept `constraints.ts` (FEATURE_NAME) only.
2. `integration/repository.ts` = localStorage not `fetch`. Reference integration = HTTP. No backend endpoint here; integration layer = persistence boundary → localStorage isolated, swappable later without touching core/domain.
3. Presentation = small primitives (StepView/ProgressDots/PrimaryAction/SkipAction) not fixed Welcome/Step/Final. Reference screens content-specific; this must fit any caller copy → primitives + `lastStepFooter` slot (e.g. home "already have account" link on last step).
4. No `__e2e__`. No route; e2e rides mounting page (home/screens.spec.ts). Module-level e2e = duplicate, covers nothing new.

Events: INIT/NEXT/PREV/SKIP only. No START/FINISH like reference — no "started" state (shows once `steps` given). "Finished" = derived (`$outcome !== null`), not trigger; NEXT-on-last + SKIP same outcome path.

Consequence: home rewrite → pass 4 steps + persistence key + onFinish navigate, drop own step state. Next decision file = home rewrite if needed.
