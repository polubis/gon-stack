---
ticket: none
scope: parka
summary: SSG pages + client-side entry control
why: Pages are prerendered, so entry control moves to the client; data stays protected by API auth and RLS
date: 2026-09-29
---

- Middleware guard removed (only sets `siteDomain`).
- `app/index`, `app/expenses`, `sign-in`, `sign-up` are prerendered (SSG).
- New `shared/auth/guard.tsx` (`AuthGuard mode="protected" | "guest"`) checks `supabaseBrowser.auth.getUser()` + `onAuthStateChange`, redirects via `APP_ROUTER`.
- Mounted once in `app-layout.astro` (persisted through `ClientRouter`) and in sign-in/sign-up pages.
