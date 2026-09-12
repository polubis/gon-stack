---
id: 0003
document: 0003-per-module-e2e-ids.md
module: shared/walkthrough
decision_ref: __decision__/0003-per-module-e2e-ids.md
status: completed
---

# 0003 — per-module type-safe e2e ids

**Progress**: completed. Added `configuration/e2e-ids.ts` to this module and `home`, root-combined into `src/__e2e__/selectors.d.ts` (replaced `` `module:${string}` `` wildcard entries). Deliberate typo verification found `Button` (`modules/shared/ui/controls.tsx`) erased `data-e2e` type-safety app-wide via `Record<string, unknown>` catch-all; fixed to type `data-e2e` as named `E2eId` prop. Typo test now fails compile with "did you mean" hint. Full suite (typecheck/lint/vitest) green after.

**Time** (local machine clock):

- First `astro check` after adding `e2e-ids.ts` files + rewriting `selectors.d.ts`: `14:58:46`.
- Deliberate-typo round-trip: `astro check` at `14:59:44` (native-element typo caught — confirmed hole was `Button`-specific, not union).
- Final green re-run after `Button` fix: vitest `Start at 15:01:52` (6 tests, 2.54s), typecheck/lint clean same pass.

Task spanned local `14:58`–`15:01` (~3 min) across checkpoints above.

**Cost**: not tracked — see 0001.
