## Project map

pnpm+turbo monorepo. `apps/*`, `packages/*`. Root: `pnpm dev|build|lint|check-types|test|test:e2e`, `pnpm --filter <app>`. Astro apps: React, Tailwind, Cloudflare adapter (`@repo/astro-config`, `prerender: true` = static). Dev `localhost:4321`. E2E: Playwright (`@repo/vibe-test`) on built `dist`, build first.

### Apps

1. `polubinski-dev` — portfolio. **Static only**, no backend/DB. e2e 4324.
2. `kdebek` — static massage landing + privacy page, CSP. e2e 4322.
3. `parka` — **full stack** finance + time/tasks. Supabase, AI, MCP. e2e 4325. See below.
4. `talent-orbit` — exams/hiring. Astro SSR, Supabase (seed, no migrations). e2e 4326.
5. `romantic-app` — couples quiz/chat/games. Astro SSR, Supabase (migrations, seed). e2e 4321.
6. `content-maker` — MDX editor, one SSR page, no DB. e2e 4323.
7. `uih-docs` — static docs for `@repo/uih`.
8. `web`, `docs` — dead Next.js starters. Ignore.

### parka

- Code: `src/modules/*` (UI), `src/server/{application,domain,mcp}`, endpoints `src/pages/api/*`.
- DB: local Supabase, Docker needed. `supabase/{migrations,tests}`. RLS everywhere, no seed. Sign-up email confirm via Mailpit `127.0.0.1:54324`.
- AI: receipt reader (`server/application/shared/receipt-reader.ts`), env `PARKA_AI_API_KEY`.
- MCP: `/api/mcp`, tokens `/api/mcp-tokens`.
- Push: env `PARKA_VAPID_*`. Env files `.env`, `.dev.vars` (from `*.example`).
- Scripts: `pnpm db:start|stop|reset|gen-types|test`, `db:migration:new|up`, `dev`. Real-backend e2e: `db:start` + `build` first.
- Gotchas: internal `fetch()` needs trailing slash. Windows: zombie `workerd.exe` locks `dist` → `taskkill //F //IM workerd.exe`.

### Packages

- `react-kit` (`cn`, Context utils), `paker` (state), `uih` (headless UI), `ui` (Next starters), `vibe-test` (e2e), `type-beast` (types), `astro-config`, `eslint-config`, `typescript-config`, `tailwind-config`.
- `nitpick` — generates `.claude/` from `.nitpick/config.ts`. Edit config, `pnpm nitpick:sync`. Never hand-edit `.claude/`.
- `arch-rules`, `dev-tools` — stale `dist` only.

### Other

`scripts/` (audit, clean, husky), `decisions/` (log), `.evidences/` (proof, uncommitted).
