---
version: 1.0
created: 26.02.2026
scope: Email/Password login only (PKCE flow, server-side)
---

# Auth Server-Side Implementation Plan

## Goal

Implement email/password authentication using Supabase Auth with the **PKCE flow** on the **server side** in the Astro app. This covers **login only** (sign in with existing account). Sign-up, password reset, and OAuth are out of scope for this plan.

---

## Architecture Alignment

Per the ADR modular monolith architecture:

```
src/
├── core/auth/              # Low-level auth client setup (Supabase SSR client)
├── shared/auth/            # Auth abstraction consumed by modules (e.g., getUser helper)
├── contracts/env/          # Environment variable type definitions
├── pages/api/auth/         # Server-side API endpoints (callback, login)
└── middleware.ts            # Astro middleware for session refresh & route protection
```

- **Core** — Supabase client factory (server-side only, cookie-based)
- **Shared** — `getUser()` helper, auth guard utilities for modules to consume
- **Contracts** — env types for `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- **Modules** — consume `shared/auth`, never touch `core/auth` directly

---

## Tech Stack

| Concern | Choice |
|---------|--------|
| Auth provider | Supabase Auth |
| Auth flow | PKCE (default in `@supabase/ssr`) |
| Client package | `@supabase/ssr` + `@supabase/supabase-js` |
| Session storage | HTTP-only cookies (managed by `@supabase/ssr`) |
| Server runtime | Astro SSR on Cloudflare Workers |

---

## Implementation Steps

### Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Step 2: Environment Variables

Add to `.env` (and Cloudflare Workers secrets for production):

```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
```

Update `src/contracts/env/env.d.ts` (or existing `src/env.d.ts`) to type these variables for Astro's `import.meta.env`.

### Step 3: Core — Supabase Server Client Factory

**File:** `src/core/auth/supabase-server-client.ts`

Create a factory function that builds a Supabase client configured for SSR with cookie-based session handling:

```ts
import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { AstroCookies } from "astro";

export function createSupabaseServerClient({
  request,
  cookies,
}: {
  request: Request;
  cookies: AstroCookies;
}) {
  return createServerClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          const parsed = parseCookieHeader(request.headers.get("Cookie") ?? "");
          return parsed.map(({ name, value }) => ({
            name,
            value: value ?? "",
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookies.set(name, value, options)
          );
        },
      },
    }
  );
}
```

Key points:
- Uses `@supabase/ssr` which defaults to PKCE flow automatically
- Reads/writes cookies via Astro's `AstroCookies` API
- No browser client needed for this scope (login is server-side action)

### Step 4: Astro Middleware — Session Refresh & Protection

**File:** `src/middleware.ts`

```ts
import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "./core/auth/supabase-server-client";

const PROTECTED_ROUTES = ["/dashboard", "/game", "/profile"];
const AUTH_ROUTES = ["/login"];

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServerClient({
    request: context.request,
    cookies: context.cookies,
  });

  // Refresh session on every request (reads/writes cookies)
  const { data: { user } } = await supabase.auth.getUser();

  // Store user in locals for downstream pages/endpoints
  context.locals.user = user;

  const { pathname } = context.url;

  // Redirect unauthenticated users away from protected routes
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r)) && !user) {
    return context.redirect("/login");
  }

  // Redirect authenticated users away from auth routes
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r)) && user) {
    return context.redirect("/dashboard");
  }

  return next();
});
```

Update `src/env.d.ts` to extend `App.Locals`:

```ts
declare namespace App {
  interface Locals extends Runtime {
    user: import("@supabase/supabase-js").User | null;
  }
}
```

### Step 5: Login API Endpoint

**File:** `src/pages/api/auth/login.ts`

Server-side endpoint that handles email/password sign-in:

```ts
import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../core/auth/supabase-server-client";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return new Response("Email and password are required", { status: 400 });
  }

  const supabase = createSupabaseServerClient({ request, cookies });

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return redirect("/dashboard", 302);
};
```

`signInWithPassword` does **not** require the PKCE code exchange — it directly returns a session and sets cookies. The PKCE flow (with `exchangeCodeForSession`) is needed for email confirmation links and OAuth redirects, which are out of scope for this plan.

### Step 6: Logout API Endpoint

**File:** `src/pages/api/auth/logout.ts`

```ts
import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../core/auth/supabase-server-client";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = createSupabaseServerClient({ request, cookies });
  await supabase.auth.signOut();
  return redirect("/login", 302);
};
```

### Step 7: Shared Auth Helper

**File:** `src/shared/auth/get-user.ts`

Abstraction layer that modules consume (per ADR — modules use `shared`, not `core`):

```ts
import type { AstroCookies } from "astro";
import { createSupabaseServerClient } from "../../core/auth/supabase-server-client";

export async function getAuthUser({
  request,
  cookies,
}: {
  request: Request;
  cookies: AstroCookies;
}) {
  const supabase = createSupabaseServerClient({ request, cookies });
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}
```

**File:** `src/shared/auth/index.ts` — barrel export

### Step 8: Login Page

**File:** `src/pages/login.astro`

A simple Astro page with an HTML form that POSTs to `/api/auth/login`. No client-side JS required for the basic flow — the form submits, the server sets cookies, and redirects.

For enhanced UX (inline error display without page reload), a React island component can be used with `client:load` that calls the same API endpoint via `fetch`.

---

## File Summary

| File | Layer | Purpose |
|------|-------|---------|
| `src/core/auth/supabase-server-client.ts` | Core | Supabase SSR client factory |
| `src/core/auth/index.ts` | Core | Barrel export |
| `src/shared/auth/get-user.ts` | Shared | Auth helper for modules |
| `src/shared/auth/index.ts` | Shared | Barrel export |
| `src/middleware.ts` | Infra | Session refresh + route guards |
| `src/pages/api/auth/login.ts` | API | Email/password sign-in |
| `src/pages/api/auth/logout.ts` | API | Sign out |
| `src/pages/login.astro` | Pages | Login page |
| `src/env.d.ts` | Contracts | Updated with `App.Locals.user` |

---

## What This Plan Does NOT Cover (Future Work)

- **Sign up** (email/password registration) — will need email confirmation callback with `exchangeCodeForSession`
- **Password reset** — will need `resetPasswordForEmail` + callback
- **Google OAuth** — will need OAuth redirect + PKCE code exchange callback
- **Auth callback endpoint** (`/api/auth/callback`) — needed for sign-up email confirmation and OAuth; not needed for plain `signInWithPassword`
- **Browser-side Supabase client** — not needed since all auth operations are server-side
- **RLS policies** — Supabase Row Level Security setup
- **Rate limiting** — protection against brute-force login attempts

---

## Key Design Decisions

1. **Server-only auth** — All auth operations happen on the server. No Supabase client runs in the browser. This is more secure (tokens never exposed to JS).

2. **PKCE by default** — `@supabase/ssr` uses PKCE automatically. For `signInWithPassword`, the session is returned directly (no code exchange needed). The PKCE code exchange becomes relevant when we add sign-up email confirmation or OAuth later.

3. **Middleware refreshes session** — Every request goes through middleware that calls `getUser()`, which validates and refreshes the JWT if needed. This keeps sessions alive and cookies up-to-date.

4. **Modules use `shared/auth`, not `core/auth`** — Per ADR, modules are isolated from core. The `shared/auth` layer provides the abstraction.

5. **Cloudflare Workers compatible** — The `@supabase/ssr` package works with any standard `Request`/`Response` runtime. No Node.js-specific APIs used.
