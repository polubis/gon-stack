# 0001 - layered sign-up module

```json
{
  "status": "done"
}
```

Restructured to configuration/domain/core/integration/presentation. Submit via RxJS `exhaustMap`, store atoms, branded credentials, `SignUpResult` union, validation in `presentation/selectors.ts`, `ErrorBoundary` in `Main`. Behavior, copy and `auth:*` ids unchanged. Added black-box tests.

Align with dashboard reference architecture; drop inline state/logic from `main.tsx`.
