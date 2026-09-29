# 0001 - Move selectors to presentation

```json
{
  "status": "done"
}
```

Moved `domain/selectors.ts` to `presentation/selectors.ts`; updated imports, tests and `AGENTS.md` layer text.

Selectors are plain client-side view logic (derivations for rendering), not domain entities/events. Domain stays types, events, formatting.
