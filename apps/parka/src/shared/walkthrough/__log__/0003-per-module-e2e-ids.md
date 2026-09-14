# 0003 - per-module type-safe e2e ids, combined centrally

```json
{
  "workTimeInMinutes": 3,
  "status": "done"
}
```

Added `configuration/e2e-ids.ts` to this module and `home`, root-combined into `src/__e2e__/selectors.d.ts` (replaced `` `module:${string}` `` wildcard entries). Deliberate typo verification found `Button` (`modules/shared/ui/controls.tsx`) erased `data-e2e` type-safety app-wide via `Record<string, unknown>` catch-all; fixed to type `data-e2e` as a named `E2eId` prop. Typo test now fails compile with a "did you mean" hint. Full suite (typecheck/lint/vitest) green after.

Root `selectors.d.ts` was a hand-maintained flat union; most modules used `` `module:${string}` `` wildcards that compile any suffix (typo `walkthrough:primry` still type-checked — namespace reservation, not real type-safety). This module owns `WALKTHROUGH_E2E_IDS` (`as const` array) + `WalkthroughE2eId` (derived union) under `configuration/` — static, framework-facing, no logic; `home` follows same pattern; root imports and unions both, replacing wildcard lines. `as const` array (not just a union) keeps ids runtime-enumerable for a future lint. `vibe-test` unchanged — `createE2eTest<TId>()` already takes the resolved `E2eId`, root combine is pure TS. While verifying, found `Button`'s passthrough props were `Record<string, unknown>`, so `data-e2e` fell into an untyped catch-all app-wide (both `PrimaryAction`/`SkipAction` use `Button`); fixed by destructuring `data-e2e` as a named typed prop. Consequence: future modules wanting real selector safety copy this pattern (own `configuration/e2e-ids.ts`, imported into root union).
