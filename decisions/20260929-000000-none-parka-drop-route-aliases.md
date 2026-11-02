---
ticket: none
scope: parka/router
summary: Drop `routes` / `apiRoutes` aliases
why: The aliases duplicated `APP_ROUTER`/`API_ROUTER`; one name per router
date: 2026-09-29
---

- Only `APP_ROUTER` / `API_ROUTER` exported.
- All call sites + docs renamed.
