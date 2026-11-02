---
ticket: none
scope: nitpick
summary: Add msw-backend-mocks rule, migrate parka tests
why: Backend mocks in frontend tests must go through msw, not replaced fetch
date: 2026-10-14
tags: [nitpick, testing, msw]
---

- New rule `msw-backend-mocks` (group `testing`, A): reports `vi.stubGlobal('fetch')`, `globalThis|global|window|self.fetch =`, `vi.spyOn(globalThis|global|window, 'fetch')`
  - Scope: `apps/*/src/**/*.test.{ts,tsx}` and `__tests__/*.{ts,tsx}`, `__e2e__` excluded; other browser API stubs stay allowed
  - `fix` shows `setupServer`/`http`/`HttpResponse` lifecycle example; wired in `.nitpick/config.ts`, docs synced to `.ai/`
- Parka tests (categories, dashboard, data-export, notifications, reports, sign-in, sign-up, settings) moved from stubbed `fetch` to msw (`onUnhandledRequest: 'error'`, `resetHandlers`, `close`)
  - Shared `startBackend`/`answerApi` helpers live next to `dashboard-backend.ts`
- Sign-in/sign-up repositories treat a 302 as a redirect too: msw cannot produce `opaqueredirect`
