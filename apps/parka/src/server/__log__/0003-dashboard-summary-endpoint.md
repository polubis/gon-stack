# 0003 - dashboard summary API + contracts

```json
{
  "status": "done"
}
```

Add server dashboard read path: `server/domain/dashboard.ts`, `application/procedures/get-dashboard`, `pages/api/dashboard.ts`, shared Zod `server-contracts/schemas/dashboard.ts`. Expose month-scoped summary DTO for backend-mode client repository.

Module integration needs typed backend boundary; no prior dashboard procedure/schema. Consequence: `repository.ts` fetches `/api/dashboard`; contracts stay shared client/server.
