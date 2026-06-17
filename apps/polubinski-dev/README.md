# polubinski-dev

A modern Astro + React + TypeScript + Tailwind CSS application running on Cloudflare Workers.

## Setup

```bash
pnpm install
```

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
pnpm test:e2e         # Run E2E tests
pnpm test:e2e:ui      # E2E tests with UI
pnpm test:e2e:report  # Show E2E report
```

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
