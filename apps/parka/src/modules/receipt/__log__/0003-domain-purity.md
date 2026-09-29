# 0003 - domain purity

```json
{
  "status": "done"
}
```

Removed configuration import and duplicated `amountOf` from `domain/receipt.ts`; `createItem`/`emptyDraft`/`addItem` take item name, `toReceipt` takes amount, notification body, payment method, fallback category. `canSave` moved to `presentation/selectors.ts`; body copy built in `presentation/main.tsx`. Tests and AGENTS.md updated.

Domain must not depend on configuration or build user-facing copy. No behavior change.
