# 0021 - Parka e2e specs on type-safe selectors and interpreter context

```json
{
  "status": "done"
}
```

Migrated every Parka e2e spec to `getByE2e` / `getByE2ePrefix` and the interpreter `e2e` context; extended `@repo/vibe-test`; added an ESLint ban on `getByTestId` in `__e2e__/`. Also earlier in the session: 50 category icons, wider color palette with custom color picker, always-visible category form. Decision recorded in `apps/parka/src/__e2e__/__log__/0002-type-safe-e2e-selectors-and-interpreter-context.md`.

Type-safety on the test side matched the `data-e2e` attribute side, which was already checked.
