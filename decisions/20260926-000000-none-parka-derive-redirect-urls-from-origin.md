---
ticket: none
scope: parka
summary: Auth redirect URLs derived from request origin
why: Auth URLs inlined at build time from `.env` cannot be overridden at runtime on a prebuilt `dist`
date: 2026-09-26
---

- e2e `backend.spec.ts` + `rest-endpoints.spec.ts` failed: confirmation email linked to `:4321` (dev port) while the e2e server runs on `:4325`.
- `PARKA_AUTH_CONFIRM_URL`/`PARKA_AUTH_CALLBACK_URL` are inlined at build time from `.env`, and the `webServer.env` override in `playwright.config.ts` cannot change a prebuilt `dist`.
- Fix: `procedure.ts` passes `origin` (`new URL(context.request.url).origin`) to handlers; `register-user` uses `${origin}/api/auth/confirm/`, `login-user` uses `${origin}/api/auth/callback/`.
- Removed both env vars (`env.d.ts`, `.env.example`) and the ineffective `webServer.env` block.
- Security: Supabase only honours `redirect_to` values in `additional_redirect_urls` (exact match) — keep that list free of wildcards.
