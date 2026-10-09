# 0035 - Receipt AI env at deploy (hardcoded endpoint, CI API key)

```json
{
  "status": "done"
}
```

Production receipt scan failed in `createClient` with `PARKA_AI_API_KEY is not set` even when a Cloudflare Worker secret existed. `receipt-reader` reads `import.meta.env.PARKA_AI_API_KEY`, which Vite inlines at **`astro build`** time. GHA deploy ran build without that variable; CF runtime secrets do not backfill a bundle built with an empty value.

Receipt AI config:

- `shared/receipt-reader.ts`: `AI_BASE_URL` and `AI_MODEL` are constants (`https://opencode.ai/zen/v1`, `gpt-6-luna`). Only `PARKA_AI_API_KEY` stays env-backed.
- `env.d.ts`, `.env.example`, `turbo.json`: dropped `PARKA_AI_BASE_URL` / `PARKA_AI_MODEL`.

Deploy:

- `.github/workflows/deploy-parka.yml`: job `deploy` sets `PARKA_AI_API_KEY: ${{ secrets.PARKA_AI_API_KEY }}` so `pnpm exec turbo run deploy --filter=parka` (`astro build && wrangler deploy`) sees the key. `verify` unchanged (tests mock AI; no production build).

Ops: add repository or `production` environment secret `PARKA_AI_API_KEY` in GitHub (same value as local `.env`). Optional cleanup: remove unused `PARKA_AI_BASE_URL` / `PARKA_AI_MODEL` from Cloudflare if still present.
