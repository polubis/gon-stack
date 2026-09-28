# 0001 - central route table in `shared/router`

```json
{
  "status": "done"
}
```

Created `src/shared/router` as the single source of truth for every route in
the Parka MPA: `routes` (17 page builders), `apiRoutes` (19 backend builders
mirroring `src/pages/api/**`), `moreSectionPaths()` (bottom-nav grouping),
`normalizePath()`, plus client-only `navigation.ts` (`navigateTo`,
`replaceUrl`, `readQueryParam`, `writeQueryParam`). Migrated ~40 call sites:
all `href`/`backHref`, `window.location.href` assignments, dashboard month
query-param sync, `fetch()` URLs (incl. generic `modules/shared/data` store
via a `collectionUrl`/`entityUrl` switch over `apiRoutes`), `Astro.redirect()`
guards, page SEO `url=` props, server procedure `location:` redirects and
OAuth `redirectTo`/`emailRedirectTo` suffixes, and `shared/navigation/app-nav`
constraints + active-key matching. E2e specs keep URL literals (they assert
real URLs).

Chose plain `const` builder functions returning strings over zod-validated
route objects or a Router class: zero dependencies, no framework coupling
(same import works in Astro frontmatter, React client, and server
procedures), and type-safety at the call site (misspelled route = compile
error, missing `id`/`month` param = compile error) with no boilerplate.
Consequence: new pages/endpoints add one builder here; hardcoded path strings
outside this module (excl. e2e) are a lint-level smell.
