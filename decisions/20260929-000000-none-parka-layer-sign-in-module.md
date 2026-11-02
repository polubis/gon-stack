---
ticket: none
scope: parka/sign-in
summary: Layered sign-in module
why: Align with dashboard reference architecture; drop inline state/logic from `main.tsx`
date: 2026-09-29
---

- Restructured to configuration/domain/core/integration/presentation.
- Submit via RxJS `exhaustMap`, store atoms, branded credentials, `SignInResult` union, validation in `presentation/selectors.ts`, `ErrorBoundary` in `Main`.
- Behavior, copy and `auth:*` ids unchanged.
- Added black-box tests.
