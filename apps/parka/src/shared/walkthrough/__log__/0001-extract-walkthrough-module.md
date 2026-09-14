# 0001 - extract generic walkthrough module

```json
{
  "status": "done"
}
```

Built full `configuration/domain/core/integration/presentation` module cloned from `user-profile-setup`, copied missing `src/libs/eda` into parka, added `rxjs`, rewired `home` to consume it, verified with unit tests + `astro check` + eslint + browser click-through (intro → next → next → last step → sign-up redirect). Verification phase alone spanned ~3min (12:17:45Z-12:20:34Z UTC); coding time before that not instrumented, so total `workTimeInMinutes` is `n/a` rather than a partial/guessed figure.

`home` had inline 4-step intro: hardcoded steps + local `useState`, no shared shape/reuse/persistence. Extracted to `shared/walkthrough`, cloned `user-profile-setup` arch, kept it a generic engine — steps via prop (`WalkthroughStep[]`), not baked-in content — for reuse across features. Layer diffs from reference: no `configuration/validation.ts` (no form here); `integration/repository.ts` uses localStorage not fetch (no backend endpoint, swappable later); presentation = small primitives + `lastStepFooter` slot, not fixed screens (must fit any caller copy); no module `__e2e__` (rides host page). Events INIT/NEXT/PREV/SKIP only, no START/FINISH — "finished" derived from outcome. Consequence: home rewrite passes 4 steps + persistence key + onFinish navigate, drops own step state.
