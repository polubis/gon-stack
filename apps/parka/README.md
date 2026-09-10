# parka

A minimal Astro + React + TypeScript + Tailwind CSS application running on Cloudflare Workers.

## Setup

```bash
pnpm install
cp .env.example .env
cp .dev.vars.example .dev.vars
```

## Backend (Supabase / Postgres)

The finance features are backed by a local Supabase stack. Docker Desktop must be
running.

```bash
pnpm db:start          # boot Postgres + Auth + Studio
pnpm db:reset          # apply migrations in supabase/migrations + per-user demo seed
pnpm db:gen-types      # regenerate src/shared/data-sources/db-schema.ts
```

Every table lives under row-level security keyed to the session user. A Postgres
trigger (`handle_new_user`) seeds a fresh demo dataset for each account on
sign-up. The React store hydrates from `GET /api/state` and writes the whole
per-user graph back through `PUT /api/state`; anonymous visitors fall back to an
in-browser demo store.

## Development

```bash
pnpm dev
```

Access the app at `http://localhost:4321`

## Build

```bash
pnpm build
```

## Testing

```bash
pnpm test              # Run unit tests
pnpm test:watch       # Watch mode
pnpm test:coverage    # Coverage report
pnpm build            # E2E runs against the built worker — build first
pnpm test:e2e         # Run E2E tests
pnpm test:e2e:ui      # E2E tests with UI
pnpm test:e2e:report  # Show E2E report
```

`src/__e2e__/backend.spec.ts` is a single end-to-end test that registers a real
account and exercises every feature against the live Supabase backend, reloading
between steps to prove each change round-tripped through Postgres. It needs
`pnpm db:start` running.

## Type Checking

```bash
pnpm check-types
```

## Linting

```bash
pnpm lint
```

## Deployment

```bash
pnpm deploy
```

## Tech Stack

- **Framework**: Astro
- **UI Library**: React
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Runtime**: Cloudflare Workers
- **Testing**: Vitest + Playwright
