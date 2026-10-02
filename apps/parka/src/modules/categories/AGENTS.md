---
version: 1.3
hash: ea66ddc2ea5b4bb197a8dd25cb0397f21cccd2b02139fdb443cd72792a7a54e0
---

# Categories

Category list + create/edit form + suggested defaults. Cloned from `../dashboard` convention. Backend-only, session required. Isolated: imports no other module.

## Architecture

1. "configuration" — `constraints.ts` (`FEATURE_NAME`, `COLORS`, `DEFAULT_CATEGORIES`, `ERROR_CODES`), `e2e-ids.ts` (`categories:*`, `categories:row:${id}`).
2. "domain" — `models.ts` (branded `CategoryId`, `CategoryIconId`, `Editing`), `events.ts` (`[TRIGGER]_LOAD/CREATE/UPDATE/DISMISS_NOTICE`), `ids.ts` (client id `cat-xxxxxxx`).
3. "core" — `store` (incl. `$notice`), `bus`, `actions/notify`, `handlers/{load,create,update,dismiss-notice}`, `registry`, `facade`, `mediator`. Create/update optimistic; rollback per item (remove created / restore previous) so batched "add all" stays correct; toast via `$notice`.
4. "integration" — `repository.ts` (GET/POST `/api/categories`, PUT `/api/categories/:id`), `mappers.ts` (DTO → domain, unknown icon → `sparkles`).
5. "presentation" — `context.tsx`, `main.tsx` (entry, `ErrorBoundary`), `category-form.tsx`, `list-skeleton.tsx`, `layout.tsx` (`Card`). Shared `ErrorState`, `LoadingBanner`, `Toast`, `Skeleton` from `@/shared/ui`.
6. "index.ts" — exports `Main` only.

## Code

Same as dashboard. Routed by `core/app-router`. Load on mount; skeleton on first load, banner on reload.
