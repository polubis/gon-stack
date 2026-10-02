# 0027 - with-auth HOC and auth status hook

```json
{
  "status": "done"
}
```

- Added `shared/auth/use-auth.ts`: primitive `useAuth` hook; single object `{ status: "checking" } | { status: "unauthenticated" } | { status: "authenticated", user: { id, displayName, avatarUrl } }`.
- Added `shared/auth/with-auth.tsx`: `withAuth(Component, { fallback, minCheckMs })`; centered spinner for min 1s, then component or fallback (no redirect).
- `AuthGuard` now built on `useAuth`; fallback handled by `withAuth`, not the hook.

Why: composable guard for client-rendered routes with fallback instead of forced redirect.

Follow-up: `shared/auth` split into `domain/` (branded `UserId`/`DisplayName`/`AvatarUrl`, `Auth` models), `integration/` (mapper, Supabase repository), `presentation/` (`useAuth`, `useMinDelay`, `AuthGuard`, `withAuth`, `CheckingScreen`).

Follow-up: `core/app-router/shell.tsx` exports `AppShell = withAuth(Shell, { fallback: <ProtectedScreen /> }`; signed-out users see a message and a button to sign-in, no redirect.

Follow-up: auth check failures (error or throw from `getUser`) resolve as `unauthenticated` in `fetchAuth`; no error state.

Follow-up: `AuthGuard` takes `redirect={{ authenticated?, unauthenticated? }}` callbacks, no `mode`, no routing imports. sign-in/sign-up `Main` render it inline with the dashboard redirect; no guest-guard util.

Follow-up: auth checked once per scope. `presentation/context.tsx` = `context('Auth', useAuth)` via react-kit -> `AuthProvider`, `useAuthContext`. `useAuth` still does the Supabase check (only called by the provider); `withAuth` and `AuthGuard` read `useAuthContext`. `AuthProvider` wraps the router in `core/app-router/main.tsx` and the guard in sign-in/sign-up `Main`.
