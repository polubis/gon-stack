---
id: 0001
document: 0001-rest-endpoint-split.md
decision_ref: __decision__/0001-rest-endpoint-split.md
---

# 0001 — split aggregate state endpoint into REST

**Progress**: done. Added per-entity procedures (list/create/update/delete) for categories, expenses, limits, goals, recurring, notifications, get/update for settings. Routes at `pages/api/<entity>.ts` + `[id].ts`, `astroAdapter`+`privateProcedure` same as existing. Exported per-entity zod pieces from `schemas/state.ts`, new `schemas/<entity>.ts` files reuse them. Old `/api/state` GET/PUT untouched, frontend still wired to it. One e2e spec `server/__e2e__/rest-endpoints.spec.ts` covers CRUD for every new endpoint. `pnpm check-types` green (0 errors).
