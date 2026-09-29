# 0018 - SSG pages + client-side entry control

```json
{
  "status": "done"
}
```

Middleware guard removed (only sets `siteDomain`). `app/index`, `app/expenses`, `sign-in`, `sign-up` are prerendered (SSG). New `shared/auth/guard.tsx` (`AuthGuard mode="protected" | "guest"`) checks `supabaseBrowser.auth.getUser()` + `onAuthStateChange`, redirects via `APP_ROUTER`. Mounted once in `app-layout.astro` (persisted through `ClientRouter`) and in sign-in/sign-up pages.

Guard is UX only; data protected by API auth + RLS. Brief flash of shell before redirect possible.
