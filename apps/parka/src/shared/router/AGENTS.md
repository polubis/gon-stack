---
version: 1.1
---

# Shared Router

Central route table for the Parka MPA at `src/shared/router`. Every page
`href`, `Astro.redirect()`, server `location:`, and client `fetch()` URL is
built here — no hardcoded path strings outside this module (e2e specs assert
real URLs and keep literals).

## Architecture

1. `routes.ts` — `route` / `routeWithQuery` / `routeWithRequiredQuery` /
   `routeById` primitives, composed into `routes` (page builders) and
   `apiRoutes` (backend builders), plus `moreSectionPaths()` and
   `normalizePath()`. Pure functions returning strings; no Astro/React
   imports.
2. `navigation.ts` — client-only `window` wrappers (`navigateTo`,
   `replaceUrl`, `readQueryParam`, `writeQueryParam`). Guarded for SSR.
3. `index.ts` — public barrel.

## Code

1. Always `const`; always arrow functions.
2. Named exports only — no default exports.
3. `type` aliases only — no `interface`, no `class`.
4. Each route is one line built from a shared primitive (`route(path)`,
   `routeWithQuery<Path, Query>(path)`, `routeById(base)`, ...) — never a
   hand-written per-route union type. A primitive infers its literal
   return type from the path/generic given; add a route by calling one,
   not by declaring a new type alias.
5. `PageUrl` (= union of every `routes` builder's return type) is the
   single source for any consumer needing "any valid page URL" — e.g. the
   layout `url` prop — instead of a hand-maintained segment-count guess.
6. Builders always emit trailing slashes; query strings skip empty values.
7. Import from `@/shared/router` in Astro frontmatter, server procedures,
   and React views alike.

## References

- [routes.ts](./routes.ts) — full page + API table.
- [navigation.ts](./navigation.ts) — client navigation helpers.
- [**tests**/routes.test.ts](./__tests__/routes.test.ts) — contract tests.
