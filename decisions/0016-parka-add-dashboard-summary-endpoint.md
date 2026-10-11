---
ticket: none
scope: parka/server
summary: Dashboard summary API + contracts
why: Dashboard module needs a typed backend boundary; no dashboard procedure or schema existed
date: 2026-09-16
---

- Add server dashboard read path: `server/domain/dashboard.ts`, `application/procedures/get-dashboard`, `pages/api/dashboard.ts`, shared Zod `server-contracts/schemas/dashboard.ts`.
- Expose month-scoped summary DTO for backend-mode client repository.
