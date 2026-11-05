---
ticket: VYB-242
scope: parka
summary: Map PGRST301/PGRST303 to 401 via fromSupabaseError
why: Token iat ahead of PostgREST clock gave random blind 500 on app start
date: 2026-11-05
---

- Cause: PostgREST rejects token with `iat` > its clock + 30s leeway (401 PGRST303); app wrapped it in a blind 500
  - Auth `getUser()` passed, so only the PostgREST clock lagged
- Reproduced on local PostgREST v16.5: iat +30s ok, +31s 401
- `fromSupabaseError` maps `PGRST301`/`PGRST303` to Unauthorized, accepts Storage errors
- All 56 server files that did `new InternalServer(<db error>)` now use `fromSupabaseError`
- Nitpick rule `supabase-error-mapping` fails `new InternalServer(error)` in `apps/*/src/server`
- Retry on PGRST303 rejected: skew window too narrow, production skew unmeasured
- Real-DB e2e `server/__e2e__/token-clock-skew.spec.ts`: re-signed session cookie gives 401, not 500; never skipped
