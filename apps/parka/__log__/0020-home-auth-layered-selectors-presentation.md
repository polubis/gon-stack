# 0020 - home/sign-in/sign-up layered; selectors in presentation

```json
{
  "status": "done"
}
```

- `sign-in`, `sign-up`: dashboard layering (configuration/domain/core/integration/presentation), RxJS `submit` handler (`exhaustMap`), branded `Email`/`Password`, validation in `presentation/selectors.ts`. Tests + `AGENTS.md` + module log.
- `home`: `configuration/constraints.ts` (steps, key), `ErrorBoundary`, tests. No empty layers (no state/fetch).
- `statistics`, `recurring`: `domain/selectors.ts` -> `presentation/selectors.ts` (plain client-side view logic).
- AGENTS.md stamped via hashy, manifest updated.
- Moved `limits/progress`, `reports/report`, `data-export/export`, `expenses/grouping` to `presentation/selectors.ts` (see module logs).

Why: selectors are client view logic, not domain.
