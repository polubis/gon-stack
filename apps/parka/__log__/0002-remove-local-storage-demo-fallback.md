# 0002 - remove localStorage demo fallback from state store

```json
{
  "models": ["claude-sonnet-5"],
  "status": "done"
}
```

Removed `apps/parka/src/modules/shared/data/store.ts`'s anonymous-mode `localStorage` persistence (`STORAGE_KEY`, `loadLocal`, `persistLocal`): the `local` mode is now `anonymous` and no longer reads/writes `window.localStorage` — unauthenticated state stays in-memory only, backend-synced state (`mode === 'backend'`) is unaffected. Updated stale references: `README.md` "anonymous visitors fall back to an in-browser demo store" line dropped, `src/__e2e__/backend.spec.ts` header comment no longer mentions the localStorage demo store.

Not needed for now per user request. `apps/parka/src/shared/walkthrough` and `apps/parka/src/shared/cookies` localStorage usage is a separate concern (walkthrough completion / cookie consent, not app data) and was left as-is.
