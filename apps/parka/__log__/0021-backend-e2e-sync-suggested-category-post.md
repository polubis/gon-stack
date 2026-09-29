# 0021 - real-backend e2e: wait for suggested category POST

```json
{
  "status": "done"
}
```

`src/__e2e__/backend.spec.ts` step “i add suggested categories and they survive a reload” now wraps the groceries chip click in `Promise.all` with `synced(page, 'POST', API_ROUTER.categories(), 201)`, matching the manual “Kultura” create step. Category create is optimistic in the UI (`[TRIGGER]_CREATE` appends the row before `postCategory` finishes); reloading immediately could run before Postgres persisted the row, so the list fell back to “Sugerowane kategorie” and `categories:row:groceries` disappeared (~2/3 runs failed).

Verified: five consecutive `chromium-real-backend` full-suite runs green after the change.

Reason: prove DB round-trip on reload without racing the per-entity REST write.
