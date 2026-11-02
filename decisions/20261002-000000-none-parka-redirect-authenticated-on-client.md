---
ticket: none
scope: parka
summary: Client-only redirect-authenticated island for sign-in/sign-up
why: "`client:only` islands are not evaluated at build, so the build no longer needs Supabase env vars"
date: 2026-10-02
---

- Added `shared/auth/presentation/redirect-authenticated.tsx`: `AuthProvider` + `AuthGuard` redirecting signed-in users to the dashboard.
- `pages/sign-in.astro`, `pages/sign-up.astro`: mount it as `<RedirectAuthenticated client:only="react" />` beside `<Main client:load />`.
- `modules/sign-in|sign-up/presentation/main.tsx`: dropped `AuthProvider`/`AuthGuard`; views no longer import Supabase.
- Not touched: real-backend e2e stays `test.skip` (`0082`).
- Cause: main-branch verify failed on `astro build`.
- `/sign-in` is prerendered and `Main` (`client:load`) is SSR'd; it imported `AuthGuard` -> `use-auth` -> `repository` -> `supabase-browser.ts`, whose top-level `createBrowserClient` throws when `PUBLIC_PARKA_SUPABASE_*` are unset in CI.
