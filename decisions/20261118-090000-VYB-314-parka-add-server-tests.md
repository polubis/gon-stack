---
ticket: VYB-314
scope: parka/server
summary: Test server adapters, mappers and mcp token domain
why: Server layer had few tests; pure behavior around errors, request parsing and tokens was uncovered.
date: 2026-11-18
---

- Layer chosen: `src/server` (domain + application adapters/shared); modules and shared/ui already covered by VYB-914..927, 311..313
- Added tests, public interface only, no mocks needed (no HTTP, so no msw)
  - `domain/mcp-token`: issuing, hashing (known SHA-256), shape check, status incl. expiry boundary
  - `adapter/astro`: body/query/params merge, multipart, bad json -> 400, json and redirect responses, no-store
  - `adapter/zod`: input -> 400 with fields, output -> 500 fixed message, lazy schema
  - `adapter/supabase`: all code mappings, 429 by status, cause kept
  - mappers: mcp token (ttl, status), task comment (renamed/deleted bot), task attachment
- Not covered: procedures need Supabase (e2e/db tests), left as is
- 23 server test files, 265 tests pass
