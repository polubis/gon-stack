# 0027 - Never barrel export

```json
{
  "status": "done"
}
```

- Rule: `rules/coding.md` #3 (A) never barrel export; `CLAUDE.md` rules table updated; `witch-doctor` fix hint no longer suggests `index.ts`
- `apps/parka`: deleted 22 barrels (`shared/{ui,router,auth,cookies,walkthrough,navigation/*}`, `core/app-router`, every `modules/*/index.ts`) and 2 pass-through re-exports (`CATEGORY_ICON_IDS`, `CategoryIconId` in categories/recurring `domain/models`)
- Importers (81 files) now import from defining file, e.g. `@/shared/ui/layout`, `@/shared/router/routes`; lazy routes import `@/modules/<m>/presentation/main`; test mocks target `@/shared/router/navigation`
- Not touched: `libs/eda/index.tsx`, `server/**/procedures/*/index.ts` (real code, not re-exports); other apps/packages still have barrels

Cause: `pages/app/[...path].astro` imported `APP_PAGES` from `core/app-router` barrel, which also re-exported the router. Prerender evaluated the whole graph, reached `supabase-browser.ts` (`createBrowserClient` at module top) and threw in CI where `PUBLIC_PARKA_SUPABASE_*` vars are unset. Worked before `2d89006` because `client:only` components are not evaluated at build.

Barrels pull unrelated code into server/prerender and bundles, and hide import cycles. Verified: lint, types, 139 unit, build with Supabase env unset.
