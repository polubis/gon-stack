# 0002 - selectors to presentation

```json
{
  "status": "done"
}
```

Moved `itemTotal`, `draftTotal`, `resolveCategory`, `defaultCategoryId` to `presentation/selectors.ts`; draft transforms stay in `domain/receipt.ts` (private `amountOf` keeps domain free of presentation imports); AGENTS.md updated.

View selectors are client-side view logic; domain stays for models/events/pure rules. No behavior change.
