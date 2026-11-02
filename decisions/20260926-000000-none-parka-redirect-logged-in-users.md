---
ticket: none
scope: parka
summary: Redirect logged-in users away from sign-in/sign-up
why: Signed-in users should not see the sign-in/sign-up forms
date: 2026-09-26
---

- `pages/sign-in.astro` + `pages/sign-up.astro`: `prerender = false`; frontmatter runs `supabaseServer(...).auth.getUser()`, user present -> `Astro.redirect('/dashboard/')`.
- Server-side (SSR) instead of a first client-side attempt (`getSession` in `Main`, removed;
  - `shared/data-sources/supabase-browser.ts` with `createBrowserClient` kept, unused, for later): no form flash, no client Supabase instance, `getUser` validates the token with Supabase rather than trusting the cookie.
