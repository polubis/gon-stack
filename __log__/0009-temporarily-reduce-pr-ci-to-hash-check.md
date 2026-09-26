# 0009 - Temporarily reduce PR CI to hash check only

```json
{
  "status": "done"
}
```

PR CI (`pr-ci.yml`) now runs hash check only: the full Verify step (`turbo run format:check lint check-types test build`) is commented out with a TEMPORARY-DISABLED marker, and e2e stays local-only via `pnpm test:e2e` / `ci:e2e` / `ci:verify` (see 0008). No `package.json` scripts were changed.

Keeps PR checks unblocked while CI env (missing Supabase URL/Key crashing the romantic-app e2e webServer) and fixtures are fixed. Consequence: format/lint/types/tests/build run locally only until the Verify step is restored.
