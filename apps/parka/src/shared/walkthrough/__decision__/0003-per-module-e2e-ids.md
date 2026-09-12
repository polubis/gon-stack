---
id: 0003
document: 0003-per-module-e2e-ids.md
module: shared/walkthrough
status: accepted
---

# 0003 — per-module e2e ids, combined centrally

Ask: type-safe `data-e2e` selectors, owned per module, combined in one place, via `vibe-test`.

Before: root `src/__e2e__/selectors.d.ts` was hand-maintained flat union. Most modules used `` `module:${string}` `` wildcard — compiles any suffix, typo `walkthrough:primry` still type-checks. Namespace reservation, not real type-safety.

Fix: this module owns `configuration/e2e-ids.ts` — `WALKTHROUGH_E2E_IDS` (`as const` array) + `WalkthroughE2eId` (derived literal union). `home` same pattern (`home/configuration/e2e-ids.ts`). Root imports both, unions into `E2eId`, replaces wildcard lines. Other modules stay on wildcard — separate migration, out of scope.

Why `configuration/`: static, framework-facing, no logic — fits layer per `AGENTS.md` and `core.md` modular rules.

Why `as const` array not union only: runtime-enumerable list too (future lint: every rendered `data-e2e` must be declared id), not just compile-time type.

`vibe-test` unchanged: `createE2eTest<TId>()` in `src/__e2e__/test.ts` already takes resolved `E2eId` — root combine is pure TS. "(A) via vibe-test" was true before; this makes "(A) type-safe" and "(A) per module, combined" true.

Consequence: future module wanting real selector safety adds own `configuration/e2e-ids.ts`, imports into root union. Pattern here to copy.

## Found while verifying: `Button` erased `data-e2e` type-safety app-wide

Typo test: `walkthrough:primary` → `walkthrough:primry`. `check-types` missed it. Root cause: `modules/shared/ui/controls.tsx` `Button` passthrough props were `Record<string, unknown>` — `data-e2e` fell into catch-all, so `<Button data-e2e="anything">` type-checked regardless of `E2eId` union, all modules. `PrimaryAction`/`SkipAction` both use `Button`. Raw `<div data-e2e=...>` checked fine — only `Button` had hole.

Fix: `Button` destructures `'data-e2e'` as named typed prop (`E2eId | undefined`), not untyped rest spread. Same typo now fails with "Did you mean 'walkthrough:primary'?". Rest of `Button` props (`Record<string, unknown>`) unchanged — wider fix out of scope.
