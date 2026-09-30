# 0022 - Zero-vulnerability policy and audit/outdated CI gates

```json
{
  "status": "done"
}
```

Fixed all 10 `undici@7.29.0` advisories (3 low, 5 moderate, 2 high): `wrangler` -> 4.144.0 in every app, `@cloudflare/vite-plugin` override -> 1.62.2, `lucide-react` -> 1.49.0 (minor bumps via `ncu`). `pnpm audit` reports none. Added `deps:audit`, `deps:outdated`, `ci:security`; wired into `ci:verify`, `ci:verify:dry` (pre-push), PR CI and Parka deploy `verify` job.

Only root causes: `@astrojs/cloudflare` and `wrangler` (via `miniflare`); override can be dropped once `@astrojs/cloudflare` requires `@cloudflare/vite-plugin` >= 1.62.2.
