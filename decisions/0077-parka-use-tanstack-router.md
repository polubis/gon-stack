---
ticket: none
scope: parka/core
summary: TanStack Router for `/app/*`
why: Navigating between app pages should not reload HTML, JS, auth guard and nav
date: 2026-10-02
---

- Dep `@tanstack/react-router`
- `core/app-router/`: `pages.ts` (title/description per page), `router.ts` (lazy routes, `trailingSlash: 'always'`), `shell.tsx` (auth guard, sidebar, sticky bottom nav, `<Outlet/>`), `main.tsx`
- `pages/app/[...path].astro` replaces 11 per-page `.astro` files + `app-layout.astro`; `getStaticPaths` from `APP_PAGES`, same URLs + SEO
- `shared/router/navigation.ts`: `registerNavigator`; `navigateTo`/`replaceUrl` use router for `/app/*`
- Shell turns in-app `<a>` clicks into client navigation (modules untouched)
- `useSyncedNavKey` reads router location instead of `astro:page-load`
- e2e: dashboard link selectors scoped to `dashboard:main`; assert no page reload
