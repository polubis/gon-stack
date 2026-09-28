# 0013 - route builders: primitive-driven types instead of per-route unions

```json
{
  "models": ["claude-sonnet-5"],
  "status": "done"
}
```

Removed hand-written per-route union types (`DashboardUrl`, `ApiDashboardUrl`)
from `shared/router/routes.ts`. Replaced with generic primitives — `route(path)`,
`routeWithQuery<Path, Query>(path)`, `routeWithRequiredQuery<Path, Query>(path)`,
`routeById(base)` — each inferring its literal return type from the path/generic
passed in. Every entry in `routes` / `apiRoutes` is now one line calling a
primitive; adding a route never needs a new type alias. Added `PageUrl` (union
of all `routes` builder return types) as the single generated type for "any
valid page URL".

Swapped the duplicated, hand-maintained segment-count `url` prop union
(`` `/${string}/${string}` `` etc., repeated verbatim in `app-layout.astro`,
`main-layout.astro`, `seo.astro`) for `PageUrl` imported from `@/shared/router`
in all three. Verified: `vitest run` (13/13), `astro check` (0 errors).

User flagged the per-route union types as "hard-coded weird logic" duplicated
per query route; asked for primitives + one config generating types instead.
Consequence: `PageUrl` is now stricter than the old guess-based union (only
paths `routes` can actually produce) — if a layout ever needs a URL outside the
`routes` table, extend `routes` first rather than widening the prop type.
