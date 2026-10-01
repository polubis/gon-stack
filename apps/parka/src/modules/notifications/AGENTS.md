---
version: 1.2
hash: e407729fc03a5019aabb823adb65b918334b660464a1870290ea9652d2869211
name: notifications
description: Read-only notifications list module. Use for list-only Parka screens fed by one endpoint.
---

# Notifications

Isolated module. List of user notifications from `/api/notifications`. Auth required, no offline source. Imports nothing from other modules.

## Architecture

1. "configuration" — `FEATURE_NAME`, `ERROR_CODES`, e2e ids.
2. "domain" — `Notification`, `NotificationKind` (`other` = unknown server kind), `Event`, `ageLabel`.
3. "core" — `store` (atoms), `bus`, `handlers/load`, `registry`, `facade`, `mediator`.
4. "integration" — `repository` (only fetch, `API_ROUTER.notifications`), `mappers` (DTO -> domain, kind narrowing).
5. "presentation" — `context`, `main` (view + `ErrorBoundary`), `notification-row`, `list-skeleton`.
6. "index.ts" — exports `Main` only.

## Code

1. `const` + arrows, named exports, `type` only, factory `createX`.
2. Events `[TRIGGER]_LOAD`; handler RxJS `ofType(...).pipe(...)`.
3. `facade.load()` on mount. `load` never clears data.
4. First load `Skeleton` (`$initializing`); reload `LoadingBanner`; error `ErrorState` (`NOTIFICATIONS_LOAD`).
5. `Main` = content only; page shell in `pages/app/notifications.astro`.
6. Tokens + `cn` only; no raw px/colors.

## References

- [core/handlers/load.ts](./core/handlers/load.ts) — load/abort/error.
- [integration/mappers.ts](./integration/mappers.ts) — kind mapping.
- [presentation/main.tsx](./presentation/main.tsx) — wiring.

> Read a reference only when the rule above is unclear.
