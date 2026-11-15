---
ticket: VYB-311
scope: parka/access-tokens
summary: Add unit tests for access tokens format, mappers and repository
why: The access tokens module had one flow test only; token masking, DTO mapping and the API client error paths were uncovered.
date: 2026-11-15
tags: [parka, access-tokens, testing]
---

- Picked access-tokens: 30 source files, one test file
- format: token mask shows only hint and tail, moment label has day and hour
- mappers: all listed fields kept, never-expiring token, revoked status, unknown fields dropped
- repository: list, create with one-time secret, pause, resume, delete, server message on every failure, aborted list
- HTTP mocked with msw, assertions on returned values and thrown errors only
- Only tests added, no production code changed
- Existing tsc error in access-tokens e2e spec (`Array.at`) left as is, not in scope
