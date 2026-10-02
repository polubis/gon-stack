# 0001 - TanStack Router for `/app/*`

```json
{
  "status": "done"
}
```

- Dep `@tanstack/react-router`
- `core/app-router/`: `pages.ts` (title/description per page), `router.ts` (lazy routes, `trailingSlash: 'always'`), `shell.tsx` (auth guard, sidebar, sticky bottom nav, `<Outlet/>`), `main.tsx`
- `pages/app/[...path].astro` replaces 11 per-page `.astro` files + `app-layout.astro`; `getStaticPaths` from `APP_PAGES`, same URLs + SEO
- `shared/router/navigation.ts`: `registerNavigator`; `navigateTo`/`replaceUrl` use router for `/app/*`
- Shell turns in-app `<a>` clicks into client navigation (modules untouched)
- `useSyncedNavKey` reads router location instead of `astro:page-load`
- e2e: dashboard link selectors scoped to `dashboard:main`; assert no page reload

Nav between app pages no longer reloads HTML/JS/auth guard/nav. Verified: lint, types, 111 unit, 30 e2e (mocked project), build prerenders all 11 pages.
