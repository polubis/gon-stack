---
ticket: none
scope: repo
summary: Add polubinski.dev custom domain routes to Worker config
why: Deploy from Wrangler never attached the domain, only workers.dev
date: 2026-10-22
tags: [polubinski-dev, cloudflare, deploy]
---

- `wrangler.jsonc`: custom domain routes for `polubinski.dev` and `www.polubinski.dev`
  - Pages project must be deleted first so the domains are free
- `wrangler.jsonc`: pin existing `SESSION` KV namespace id
  - Auto-provisioning failed, namespace `polubinski-dev-session` already existed
- README: deploy via `pnpm run deploy`, built-in `pnpm deploy` does not run the script
