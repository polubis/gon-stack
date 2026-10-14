---
ticket: none
scope: parka
summary: Move auth fully server-side and add multi-account switching
why: Tokens must never reach JS; one browser should hold several accounts and switch between them
date: 2026-10-14
tags: [auth, security, multi-account, cookies]
---

- Auth server-side only: `supabaseBrowser` removed; client asks `GET /api/auth/me/` (Zod in/out) for the user
  - `fetchAuth` + cross-tab `BroadcastChannel` + refetch on tab focus replace `onAuthStateChange`
  - A different user than the one shown reloads the page, dropping stale in-memory data
- Session cookies forced `httpOnly`, `SameSite=Lax`, `path=/`, `Secure` on https (`session-store.ts`); API responses `Cache-Control: private, no-store`
- Multi-account store: one httpOnly cookie set per account (`parka-acct.<userId>[.N]`), pointer `parka-active`, cap 5
  - Supabase only sees the active account under `parka-auth`; token rotation lands on the active account automatically
  - Cookie name changed from `sb-*-auth-token`: existing sessions are signed out once
- Endpoints: `GET /api/auth/accounts/` (userId, email, avatar only), `POST /api/auth/switch/` (validates id, drops dead session), `POST /api/auth/logout/` (active, `userId` or `all`), login = add account (409 at cap)
  - Google OAuth sign-in at the cap is refused up front; confirm/callback flows add the account like login
- UI: `AccountMenu` in sidebar and bottom nav (Radix popover, `menuitemradio`, arrow/Home/End keys, skeleton, error pattern); switch reloads to dashboard with success toast
  - `reconcileDevice`: on user change clear remembered form fields and unsubscribe the browser web-push subscription
- Removed `RedirectAuthenticated`/`AuthGuard` from sign-in and sign-up so signed-in users can add accounts
- Tests: `session-store` unit (cookie flags, rotation, chunks, switch, forget), `account-menu` msw test, real-backend `accounts.spec.ts` (two accounts, per-account data, httpOnly, switch, logout)
  - `signInAsTestUser` now stubs `/api/auth/me/` + `/api/auth/accounts/` instead of seeding a Supabase cookie
- Proof: `.evidences/multi-account-proof.webm` (real local backend), gitignored
