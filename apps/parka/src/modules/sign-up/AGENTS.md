---
version: 1.3
hash: dd6d7fd987424d50aac32c82fcf5b35f5866b8dea388e62b1334969feb72ea9f
---

# Sign up

Public registration page (not under /app, prerendered by `pages/sign-up.astro` with a guest `AuthGuard`). Layered, event-driven form: submit credentials to `/api/auth/register`, react to redirect / rejection or pending e-mail confirmation.

## Architecture

1. "configuration" — `constraints.ts` (`FEATURE_NAME`, `ERROR_CODES`, `MESSAGES` copy); `e2e-ids.ts` (`auth:*` ids).
2. "domain" — `models.ts` (branded `Email`/`Password`, `Credentials`, `SignUpResult` discriminated union); `events.ts` (`[TRIGGER]_SUBMIT`).
3. "core" — `store.ts` atoms (`$pending`, `$error`, `$redirected`, `$awaitingConfirmation`); `bus.ts`; `handlers/submit.ts` (RxJS `exhaustMap`: no double submit); `registry.ts`; `facade.ts`; `mediator.ts`.
4. "integration" — `repository.ts` only fetch (`API_ROUTER`, `redirect: 'manual'`; `opaqueredirect` -> `redirected`); `mappers.ts` DTO -> `SignUpResult`.
5. "presentation" — `context.tsx`; `main.tsx` (`ErrorBoundary` + `Provider` + view; navigates to `APP_ROUTER.dashboard()` when `$redirected`); `selectors.ts` (client-side validation: email has `@`, password >= 6; error message choice); `social-buttons.tsx`.
6. "index.ts" — exports `Main` only.

## Code

1. `const` + arrows, named exports, `type` only, factories `createX`.
2. Validation is presentation logic (`selectors.ts`), not domain.
3. Network failure -> `MESSAGES.unreachable` in `$error`; view shows it in `role="alert"`.
4. E2e ids `auth:*` unchanged. Tokens + `cn` only.
5. Imports nothing from other modules.

## References

- [core/handlers/submit.ts](./core/handlers/submit.ts) — submit flow.
- [presentation/selectors.ts](./presentation/selectors.ts) — validation.
- [**tests**](./__tests__) — black-box flow, mapper, selector tests.

> Read a reference only when the rule above is unclear.
