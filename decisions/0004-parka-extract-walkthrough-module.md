---
ticket: none
scope: parka/walkthrough
summary: Extract generic walkthrough module
why: "`home` had hardcoded intro steps with local state and no shared shape, reuse or persistence"
date: 2026-09-14
---

- Built full `configuration/domain/core/integration/presentation` module cloned from `user-profile-setup`, copied missing `src/libs/eda` into parka, added `rxjs`, rewired `home` to consume it
  - verified with unit tests + `astro check` + eslint + browser click-through (intro → next → next → last step → sign-up redirect).
- Extracted to `shared/walkthrough`, cloned `user-profile-setup` arch, kept it a generic engine — steps via prop (`WalkthroughStep[]`), not baked-in content — for reuse across features.
- Layer diffs from reference: no `configuration/validation.ts` (no form here);
  - `integration/repository.ts` uses localStorage not fetch (no backend endpoint, swappable later)
  - presentation = small primitives + `lastStepFooter` slot, not fixed screens (must fit any caller copy)
  - no module `__e2e__` (rides host page).
- Events INIT/NEXT/PREV/SKIP only, no START/FINISH — "finished" derived from outcome.
- Consequence: home rewrite passes 4 steps + persistence key + onFinish navigate, drops own step state.
