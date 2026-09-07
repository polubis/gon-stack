---
version: 1.0.0
name: Supabase Guide
cdate: 28.08.2026
mdate: 28.08.2026
tags: supabase,docker,cli,local-dev,cloud
---

# Supabase: Local Dev → Supabase Cloud

## Recommended path

For **develop locally, then publish to a Supabase Cloud account**, use the **Supabase CLI** (`supabase start`). Do **not** use the [self-hosted Docker guide](https://supabase.com/docs/guides/self-hosting/docker) for this workflow.

|                             | **Supabase CLI** (`supabase start`)        | **Self-hosted Docker**                      |
| --------------------------- | ------------------------------------------ | ------------------------------------------- |
| Purpose                     | Local dev, deploy schema to Supabase Cloud | Run your own Supabase server (VPS, on-prem) |
| Docker                      | CLI manages containers                     | You manage `docker-compose` yourself        |
| Publish to Supabase account | Yes — `supabase link` + `supabase db push` | No — not the intended path                  |
| Typical use                 | App development                            | Production self-hosting                     |

Self-hosted Docker is for running Supabase on **your own infrastructure**. There is no one-click path from that stack to Supabase Cloud — migration would be manual (`pg_dump`, Auth URL reconfiguration, Storage, etc.).

---

## Prerequisites

- [Docker Desktop](https://docs.docker.com/desktop/install/windows-install/) running
- Node.js 20+
- Supabase CLI as an app **devDependency** (see setup below) — scripts use `pnpx supabase`

---

## App setup (`package.json`)

Each app that uses Supabase should pin the CLI and expose **script aliases** so commands are consistent across the monorepo.

**1. Add the CLI devDependency** (see `apps/romantic-app/package.json`):

```json
"devDependencies": {
  "supabase": "^2.115.0"
}
```

**2. Add `db:*` script aliases** — copy this block into the app's `"scripts"`:

```json
"db:init": "pnpx supabase init",
"db:start": "pnpx supabase start",
"db:stop": "pnpx supabase stop",
"db:reset": "pnpx supabase db reset",
"db:migration:new": "pnpx supabase migration new",
"db:migration:up": "pnpx supabase migration up",
"db:gen-types": "pnpx supabase gen types typescript --local > src/shared/data-sources/db-schema.ts"
```

| Alias              | Command                  | When to use                                                    |
| ------------------ | ------------------------ | -------------------------------------------------------------- |
| `db:init`          | `supabase init`          | Once per app — creates `supabase/` (config, migrations folder) |
| `db:start`         | `supabase start`         | Start local Docker stack                                       |
| `db:stop`          | `supabase stop`          | Stop local stack                                               |
| `db:reset`         | `supabase db reset`      | Re-apply all migrations + seed                                 |
| `db:migration:new` | `supabase migration new` | Create a new migration file                                    |
| `db:migration:up`  | `supabase migration up`  | Apply pending migrations without full reset                    |
| `db:gen-types`     | `supabase gen types …`   | Regenerate TypeScript types from local schema                  |

Adjust the `db:gen-types` output path to match your app's layout.

**3. Exclude generated Supabase files from TypeScript** (optional but recommended):

```json
"exclude": ["supabase", "dist"]
```

**4. Root-level aliases** — the repo root already forwards common tasks via Turbo (`package.json` → `turbo run db:*`). From the monorepo root:

```bash
pnpm db:start
pnpm db:stop
pnpm db:reset
pnpm db:gen-types
```

Turbo runs the matching script in every app that defines it (`turbo.json` registers `db:start`, `db:stop`, `db:reset`, `db:gen-types`).

---

## Local setup (CLI)

From the app directory, use the script aliases (preferred) or call the CLI directly.

Initialize once per app:

```bash
cd apps/your-app
pnpm db:init
# or: pnpx supabase init
```

Start the local stack (Docker under the hood):

```bash
pnpm db:start
# or: pnpx supabase start
```

Local services:

| Service  | URL                                                       |
| -------- | --------------------------------------------------------- |
| Studio   | `http://127.0.0.1:54323`                                  |
| API      | `http://127.0.0.1:54321`                                  |
| Postgres | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |

Use the publishable and secret keys printed by `supabase start` in local env files.

---

## Schema development

**Migration file:**

```bash
pnpm db:migration:new my_feature
# edit supabase/migrations/<timestamp>_my_feature.sql
pnpm db:reset
```

Regenerate types after schema changes:

```bash
pnpm db:gen-types
```

**Studio UI, then diff:**

```bash
# make changes in Studio at localhost:54323
pnpx supabase db diff -f my_feature
```

---

## Publish to Supabase Cloud

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Copy the **Project ID** from the URL: `https://supabase.com/dashboard/project/<project-id>`

```bash
pnpx supabase login
pnpx supabase link --project-ref <project-id>
```

If the cloud project already has schema from Dashboard edits:

```bash
pnpx supabase db pull
```

Push migrations to the linked project:

```bash
pnpx supabase db push
pnpx supabase migration list
```

Production app env (Dashboard → **Project Settings → API**):

- `SUPABASE_URL` → `https://<ref>.supabase.co`
- Publishable / anon key (client)
- Secret / service role key (server only)

Local and cloud keys are different — use separate env files per environment.

---

## Monorepo reference

`apps/romantic-app` is the canonical example — full `package.json` scripts block:

```json
"db:init": "pnpx supabase init",
"db:start": "pnpx supabase start",
"db:gen-types": "pnpx supabase gen types typescript --local > src/shared/data-sources/db-schema.ts",
"db:reset": "pnpx supabase db reset",
"db:stop": "pnpx supabase stop",
"db:migration:new": "pnpx supabase migration new",
"db:migration:up": "pnpx supabase migration up"
```

Generated artifacts live under `apps/romantic-app/supabase/` (`config.toml`, `migrations/`, `seed.sql`). Types land in `src/shared/data-sources/db-schema.ts`.

When adding Supabase to a new app, copy the devDependency + script aliases above, then run `pnpm db:init` from that app.

---

## When to use self-hosted Docker

Use [Self-Hosting with Docker](https://supabase.com/docs/guides/self-hosting/docker) only when you need to **host Supabase yourself** (VPS, homelab, air-gapped). Studio defaults to `http://localhost:8000` behind basic auth. Minimum: 4 GB RAM, 2 CPU cores, 40 GB disk.

---

## Cheat sheet

```bash
# Local (from apps/your-app — prefer db:* aliases)
pnpm db:init
pnpm db:start
pnpm db:migration:new add_users
pnpm db:reset
pnpm db:gen-types
pnpm db:stop

# Cloud (CLI — no aliases yet)
pnpx supabase login
pnpx supabase link --project-ref <project-id>
pnpx supabase db push
```
