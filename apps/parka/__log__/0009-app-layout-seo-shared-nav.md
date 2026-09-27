# 0009 - app layout stack, shared app-nav, dashboard + expenses

```json
{
  "status": "done"
}
```

Renamed `core/layouts/main.astro` → `seo.astro` (shared document shell) plus thin `main-layout.astro`; all non-app pages import `main-layout.astro`. Split Astro shells: `seo.astro` (meta, OG/Twitter, cookie consent), `main-layout.astro` (marketing/auth, no router), `app-layout.astro` (signed-in app: `ClientRouter` via `head-extra` slot, mobile frame, persisted `SyncedAppNav`). Added `shared/navigation/app-nav` (`NavKey` in `domain/models.ts`, `activeNavKeyFromPathname`, `NAV_ITEMS` / `MORE_SECTION_PATHS`, presentational `AppNav`, client `SyncedAppNav` + `useSyncedNavKey` on `astro:page-load`). `modules/shared/ui` `AppShell` renders shared `AppNav` (removed local `BottomNav`). Migrated `/dashboard/` and `/expenses/` to `AppLayout` + `client:only="react"`; dropped module `AppShell` wrapper there. Legacy signed-in routes still use `AppShell` + `AppNav active={nav}` until migrated.

Two full HTML layouts duplicated SEO and cookies; each signed-in page remounted React `AppShell` and `BottomNav` on every navigation. Centralizing shell in `app-layout` with persisted nav matches `ClientRouter` (swap slot content, sync tab from pathname). `AppNav` stays SSR-safe; browser APIs live only in `SyncedAppNav`. Consequence: new signed-in pages use `AppLayout` and page content only; keep `main-layout` for public/auth; extend `MORE_SECTION_PATHS` when adding “Więcej” routes.
