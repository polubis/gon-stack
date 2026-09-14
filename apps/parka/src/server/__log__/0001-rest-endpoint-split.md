# 0001 - split aggregate state endpoint into REST

```json
{
  "status": "done"
}
```

Added per-entity procedures (list/create/update/delete) for categories, expenses, limits, goals, recurring, notifications, get/update for settings. Routes at `pages/api/<entity>.ts` + `[id].ts`, `astroAdapter`+`privateProcedure` same as existing. Exported per-entity zod pieces from `schemas/state.ts`, new `schemas/<entity>.ts` files reuse them. Old `/api/state` GET/PUT untouched, frontend still wired to it. One e2e spec `server/__e2e__/rest-endpoints.spec.ts` covers CRUD for every new endpoint. `pnpm check-types` green.

`/api/state` GET/PUT did full-graph read/wipe-reinsert for every mutation. Added proper per-entity REST endpoints backend-side only, no frontend/store changes: one procedure per action, each a targeted Supabase call scoped by the authed user, no generic table-name loops. Left `/api/state` and `sync-state`/`get-state` in place — additive backend capability, frontend still calls them. Isolation over duplication: each entity's procedure duplicates its own row-mapping instead of sharing a generic CRUD helper. Consequence: `/api/state` and the new endpoints can both write the same tables; a future task should migrate the store to the new endpoints and retire the aggregate one.
