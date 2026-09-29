---
version: 1.2
hash: 3681f4cd1db34b896adc2eb8aefdf42bdd38b9a61773eb31fb1165f168eeaf62
---



# Settings

Profile edit, notification toggles, links to detail pages, sign-out. Cloned from `../expenses` convention. Backend-only, session required. Isolated: imports nothing from other modules.

## Architecture

1. "configuration" — `constraints.ts` (`FEATURE_NAME`, `ERROR_CODES`, `LINKS`, `NOTIFICATION_OPTIONS`), `e2e-ids.ts` (`settings:*`).
2. "domain" — `models.ts` (`Settings`, `NotificationKey`, `Notice`), `events.ts` (`[TRIGGER]_LOAD/UPDATE/SIGN_OUT/DISMISS_NOTICE`).
3. "core" — `store` (`$settings`, `$initializing`, `$isLoading`, `$isSigningOut`, `$error`, `$notice`), `bus`, `actions/notify`, `handlers/{load,update,sign-out,dismiss-notice}`, `registry`, `facade`, `mediator`. Update optimistic: snapshot, rollback on failure, toast via `$notice`. Sign-out: logout call, then `navigateTo(APP_ROUTER.signIn())` even on failure.
4. "integration" — `repository.ts` (only fetcher: `GET/PUT /api/settings`, `POST /api/auth/logout`, via `API_ROUTER`), `mappers.ts` (DTO <-> domain).
5. "presentation" — `context.tsx`, `main.tsx` (entry, `ErrorBoundary`, `Skeleton` on first load, `LoadingBanner` on reload, `ErrorState`, `Toast`), `settings-skeleton.tsx`. Shared UI from `@/shared/ui`. Tokens only.
6. "index.ts" — exports `Main` only.

## Code

`const` + arrows, named exports, `type` aliases, `createX` factories. Presentation reaches core via facade only. Loads on mount via `facade.load()`. Mounted by `pages/app/settings.astro`; no module shell/nav.
