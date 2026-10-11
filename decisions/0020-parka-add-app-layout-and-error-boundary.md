---
ticket: none
scope: parka
summary: App layout shell + react-kit ErrorBoundary
why: Page shell belonged in app `core/`, not per-page duplication; dashboard hydration needed an isolated React root without Astro client-router conflicts
date: 2026-09-17
---

- Extract `core/layouts/app-layout.astro` (meta, OG/Twitter, ClientRouter, cookie consent) and switch `dashboard.astro` from `main.astro` to `AppLayout` with `client:only="react"`.
- Add `@repo/react-kit` `ErrorBoundary` (render-prop fallback, `resetKeys`, `onError`) + unit tests; wire on dashboard `Main`.
- Reusable boundary keeps module fallbacks local while sharing recovery semantics.
- Consequence: feature pages use `AppLayout`; modules wrap risky trees with `ErrorBoundary`.
