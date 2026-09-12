---
id: 0001
document: 0001-rest-endpoint-split.md
module: server
status: accepted
---

# 0001 — REST endpoints alongside aggregate state endpoint

Ask: `/api/state` GET/PUT did full-graph read/wipe-reinsert for every mutation. Add proper per-entity REST endpoints backend-side only, no frontend/store changes.

Fix: one procedure per action (`list-x`/`create-x`/`update-x`/`delete-x`), each a targeted Supabase call scoped by the authed user, no generic table-name loops. Left `/api/state` and `sync-state`/`get-state` in place — frontend still calls them, this is additive backend capability.

Isolation over duplication (core.md): each entity's procedure duplicates its own row-mapping instead of sharing a generic CRUD helper.

Consequence: `/api/state` and the new endpoints can both write the same tables; nothing enforces using one path over the other yet — a future task should migrate the store to the new endpoints and retire the aggregate one.
