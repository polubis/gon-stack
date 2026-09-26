# 0005 - e2e sign-up via real email confirmation

```json
{
  "models": ["claude-sonnet-5"],
  "status": "done"
}
```

Sign-up email confirmation (`enable_confirmations = true`) made `POST /api/auth/register/` return 200 `{ ok: true }` with no session, so `backend.spec.ts` and `rest-endpoints.spec.ts` timed out on `waitForURL('**/dashboard/')`.

Fix: new `src/__e2e__/mailbox.ts` -> `registerAndConfirm(page, email, password)`. Submits sign-up form, asserts `role=status` info, polls local Supabase Mailpit (`127.0.0.1:54324/api/v1/search?query=to:<email>`), extracts `/auth/v1/verify?...` link, `page.goto`s it in the same context (PKCE verifier cookie lives there) -> `/api/auth/confirm/` -> `/dashboard/`. Both real-backend specs use it.

Also `supabase/config.toml`: added `http://127.0.0.1:4325/api/auth/confirm/` to `additional_redirect_urls`; otherwise Supabase ignores `emailRedirectTo` and falls back to `site_url`.

Rejected: disabling confirmations for tests (hides the real flow), service-role admin `createUser({ email_confirm: true })` (bypasses register + confirm endpoints).

Needs `pnpm db:stop && pnpm db:start` after config change. Verified: 31/31 e2e green.
