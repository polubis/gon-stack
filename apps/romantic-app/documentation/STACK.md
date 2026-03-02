---
version: 1.0
updated: 10.02.2026
---

# Technology Stack

---

## Frontend

### Astro (SSG)

- **Why:** API endpoints work in SSG mode (unlike Next.js), 3-5x smaller bundles, perfect Lighthouse scores, $0 hosting cost
- **Alternative rejected:** Next.js (API routes disabled in SSG, higher cost at scale)

### React

- **Why:** Largest UI ecosystem, works with Astro islands, team familiarity

### Tailwind CSS

- **Why:** Utility-first, small bundles, rapid development

### TanStack Router

- **Why:** Type-safe routing, excellent DX, supports both client-side rendering (SPA) and SSR capabilities
- **Use for:** `/app/` specific routes that require client-side rendering (SPA behavior) with SSR capabilities
- **Alternative rejected:** React Router (less type-safe, weaker SSR support)

---

## State Management

### RxJS + Nanostores

- **Why RxJS:** Perfect for real-time game state and complex async flows
- **Why Nanostores:** Lightweight (<1KB) for simple UI state, framework-agnostic

---

## Data Layer

### TanStack Query

- **Why:** Best-in-class data fetching, automatic caching, optimistic updates, perfect Supabase integration

### oRPC

- **Why:** End-to-end type safety, minimal boilerplate, works perfectly with Cloudflare Functions

---

## Backend

### Cloudflare Pages

- **Why:** Best DDoS protection, 200+ edge locations, $0 cost forever, unlimited bandwidth
- **Alternative rejected:** Vercel ($20/mo at scale, less DDoS protection)

### Cloudflare Functions

- **Why:** Works in Astro SSG, edge-deployed (0-50ms), no cold starts, $0-5/mo
- **Use for:** Complex calculations (10% of operations)

### Supabase (PostgreSQL)

- **Why:** Direct client-to-DB (90% of ops), RLS security, real-time built-in, full SQL support
- **Alternative rejected:** Firebase (NoSQL limitations, no joins, must denormalize)

### Supabase Auth

- **Why:** Built-in, $0 cost, Google OAuth + Email/Password, works with RLS

### Supabase Realtime

- **Why:** Built-in WebSockets, perfect for game sessions, zero config

---

## Package Management

### pnpm

- **Why:** Faster than npm/yarn, efficient disk usage, strict dependency resolution
- **Most common commands:**
  - `pnpm install` - Install dependencies
  - `pnpm add <package>` - Add a dependency
  - `pnpm add -D <package>` - Add a dev dependency
  - `pnpm remove <package>` - Remove a dependency
  - `pnpm update` - Update dependencies
  - `pnpm exec <command>` - Execute a command (equivalent to npx)
  - `pnpm run <script>` - Run a package.json script
  - `pnpm dlx <package>` - Download and execute a package (like npx)

### Turborepo

- **Why:** High-performance monorepo build system, intelligent caching, parallel task execution, dependency graph optimization
- **Use for:** Orchestrating builds, linting, type checking, and dev tasks across multiple apps/packages in the monorepo
- **Most common commands:**
  - `pnpm run build` - Build all packages/apps (uses `turbo run build`)
  - `pnpm run dev` - Start dev servers for all packages/apps (uses `turbo run dev`)
  - `pnpm run lint` - Lint all packages/apps (uses `turbo run lint`)
  - `pnpm run check-types` - Type check all packages/apps (uses `turbo run check-types`)
- **Configuration:** `turbo.json` defines task pipelines with dependency graphs and caching strategies

---
