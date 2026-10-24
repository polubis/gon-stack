---
ticket: none
scope: parka/mcp
summary: Read the request body before every MCP response
why: Early refusals left the body unread and workerd dropped the kept-alive connection, so e2e requests randomly got 500
date: 2026-10-24
tags: [parka, bugfix, mcp, e2e, flaky]
---

- `src/server/mcp/http.ts`: `handleMcpRequest` now wraps `respond` and calls `discardBody` before returning, on every path
  - body reading capped at `MAX_BODY_BYTES` by shared `readChunks`, reused by `readBody`
- Root cause of flaky `accounts.spec.ts` / `access-tokens.spec.ts`: 401/403/415/400 returned before the body was read
  - on a kept-alive socket `wrangler dev` (workerd) then logged `Network connection lost` and the next request got 500
  - reproduced without Playwright: 150 keep-alive POSTs with foreign `Origin` gave ~45% 500; empty body, no keep-alive (`curl`) and GET never failed
- Rejected: `retries`, `workers: 1`, `Connection: close`, fresh request context per call; they hide the server defect
- Verified: keep-alive script 0/750 failures after the fix; 15 e2e runs of both specs all green with no `Network connection lost`
- Not checked: whether production Cloudflare edge behaves the same
- Test: `mcp-endpoint.test.ts` asserts the body is consumed for foreign origin, missing token and wrong content type
