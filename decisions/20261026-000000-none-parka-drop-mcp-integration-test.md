---
ticket: none
scope: parka/mcp
summary: MCP integration test removed
why: It read .env and needed local Supabase, so it failed in CI
date: 2026-10-26
tags: [parka, mcp, testing]
---

- Removed `server/mcp/__integration__/mcp-task-management.test.ts`
  - it read `.env` and talked to a local Supabase, neither exists in CI
- MCP task tools stay covered by mocked-gateway unit tests and the access-tokens e2e
