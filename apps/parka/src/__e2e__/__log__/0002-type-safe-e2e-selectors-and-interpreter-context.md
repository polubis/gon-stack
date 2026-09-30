# 0002 - e2e specs use type-safe selectors through the interpreter context

```json
{
  "status": "done"
}
```

All Parka e2e specs (`flows`, `backend`, `screens`, `server/__e2e__/rest-endpoints`) now run through `test` from `src/__e2e__/test.ts` (`createE2eTest<E2eId>()`) and pass the `e2e` fixture (`{ page, getByE2e, getByE2ePrefix }`) to `interpreter(commands, e2e)`. Commands are typed `CommandRegistry<Ctx>` and destructure only what they use. `registerAndConfirm` in `mailbox.ts` takes the same `Ctx`.

Decision: `page.getByTestId(...)` and regex test ids are no longer allowed in e2e code. Static and dynamic ids go through `getByE2e(id: E2eId)`; ids with a runtime-generated tail (receipt item fields) go through `getByE2ePrefix('receipt:item-name:')`, whose prefix must be the start of a declared id. `@repo/vibe-test` gained `getByE2ePrefix`, the `e2e` fixture and the `E2eContext` type. An ESLint `no-restricted-syntax` rule in `apps/parka/eslint.config.mjs` bans `getByTestId` under `__e2e__/`.

Reason: `getByTestId` accepts any string, so typos and renamed ids only failed at runtime as timeouts, while the `data-e2e` side was already type-checked. Now both sides fail at compile time, per `rules/testing.md` (E2E: unique type-safe selectors).
