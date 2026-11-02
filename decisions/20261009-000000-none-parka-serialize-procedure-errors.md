---
ticket: none
scope: parka
summary: Serialize procedure errors for Cloudflare logs
why: "`console.error(error)` on Workers hid `cause`, so production failures looked like a generic Internal Server Error"
date: 2026-10-09
---

- `console.error(error)` on Workers often hid `cause` (e.g. missing `PARKA_AI_*` behind generic `Internal Server Error`).
- Server:
  - `core/logger.ts`: private serializer (`APIError.json()`, stack, nested `cause`, depth cap, safe plain objects); exported `logger(error, level)` writes `LOGGER: {json}` to `console.error` / `console.warn` (grep-friendly in Observability).
  - `procedure.ts`: catch block calls `logger` (5xx → error, 4xx → warn). Client response unchanged (`error.json()` only).
- Tests:
  - `core/__tests__/logger.test.ts`: `describe('procedure error logging')`, black-box checks via captured console output (11 cases).
