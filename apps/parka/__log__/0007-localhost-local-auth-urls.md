# 0007 - local dev URLs use localhost consistently

```json
{
  "status": "done"
}
```

Aligned local Parka URLs on the **`localhost`** host (exact-match Supabase redirect allow list):

- `.env.example` and local `.env`: `PUBLIC_PARKA_SUPABASE_URL`, `PARKA_AUTH_CALLBACK_URL`, `PARKA_AUTH_CONFIRM_URL` → `http://localhost:…` (`:54321` API, `:4321` app auth routes).
- `supabase/config.toml`: `[auth]` `site_url` `http://localhost:4321`; `additional_redirect_urls` for `:4321` (pnpm dev) and `:4325` (e2e) callback/confirm paths; `[studio]` `api_url` `http://localhost`.
- `playwright.config.ts`: `host: 'localhost'`, webServer env overrides auth URLs to `http://localhost:4325/…`.
- `src/__e2e__/mailbox.ts` Mailpit base `http://localhost:54324`; unit test stub in `src/__tests__/setup.ts`.

Supabase treats `localhost` and `127.0.0.1` as different redirect targets. Mixed hosts (e.g. auth env on `localhost`, `config.toml` on `127.0.0.1` or default `site_url` `:3000`) caused post-confirm redirects to the wrong origin. One host string everywhere removes that class of bug; e2e keeps a separate port (`4325`) with matching allow-list entries and Playwright env overrides.

After pull: `pnpm db:stop && pnpm db:start`, restart dev, open `http://localhost:4321`, request a fresh confirmation email.
