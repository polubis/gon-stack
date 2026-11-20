## Project map

pnpm+turbo monorepo. `apps/*`, `packages/*`. Root: `pnpm dev|build|lint|check-types|test|test:e2e`, `pnpm --filter <app>`. Astro apps: React, Tailwind, Cloudflare adapter (`@repo/astro-config`, `prerender: true` = static). Ports: only `packages/ecosystem-resources/src/ports.ts` (dev 43xx, e2e 44xx, Supabase 54100/54200/54300 blocks), never hardcode. E2E: Playwright (`@repo/vibe-test`) on built `dist`, build first.

### Apps

1. `polubinski-dev` — portfolio. **Static only**, no backend/DB. dev 4301, e2e 4401.
2. `kdebek` — static massage landing + privacy page, CSP. dev 4302, e2e 4402.
3. `parka` — **full stack** finance + time/tasks. Supabase, AI, MCP. dev 4303, e2e 4403. See below.
4. `talent-orbit` — exams/hiring. Astro SSR, Supabase (seed, no migrations). dev 4304, e2e 4404.
5. `romantic-app` — couples quiz/chat/games. Astro SSR, Supabase (migrations, seed). dev 4305, e2e 4405.
6. `content-maker` — MDX editor, one SSR page, no DB. dev 4306, e2e 4406.
7. `uih-docs` — static docs for `@repo/uih`. dev 4307, e2e (uih) 4407.
8. `web`, `docs` — dead Next.js starters. Ignore.

### parka

- Code: `src/modules/*` (UI), `src/server/{application,domain,mcp}`, endpoints `src/pages/api/*`.
- DB: local Supabase, Docker needed. `supabase/{migrations,tests}`. RLS everywhere, no seed. Sign-up email confirm via Mailpit on parka mail port (54106).
- AI: receipt reader (`server/application/shared/receipt-reader.ts`), env `PARKA_AI_API_KEY`.
- MCP: `/api/mcp`, tokens `/api/mcp-tokens`.
- Push: env `PARKA_VAPID_*`. Env files `.env`, `.dev.vars` (from `*.example`).
- Scripts: `pnpm db:start|stop|reset|gen-types|test`, `db:migration:new|up`, `dev`. Real-backend e2e: `db:start` + `build` first.
- Gotchas: internal `fetch()` needs trailing slash. Windows: zombie `workerd.exe` locks `dist` → `taskkill //F //IM workerd.exe`.

### Packages

- `react-kit` (`cn`, Context utils), `paker` (state), `uih` (headless UI), `ui` (Next starters), `vibe-test` (e2e), `type-beast` (types), `astro-config`, `eslint-config`, `typescript-config`, `tailwind-config`.
- `ecosystem-resources` — port registry (validated), Supabase/env sync, `pnpm reset`. `pnpm ecosystem:sync|check`. `pnpm reset` = white-page cleanup (evidences, Playwright output, DB stop+wipe, kill all ports), main agent only, `--dry-run` previews.
- `nitpick` — generates `.claude/` from `.nitpick/config.ts`. Edit config, `pnpm nitpick:sync`. Never hand-edit `.claude/`.
- `arch-rules`, `dev-tools` — stale `dist` only.

### Other

`scripts/` (audit, clean, husky), `.ecosystem/config.ts` (reset + sync config), `decisions/` (log), `.evidences/` (proof, uncommitted).
