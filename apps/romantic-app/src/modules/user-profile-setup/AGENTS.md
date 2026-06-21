---
version: 1.5
hash: 015f9f1c15c5f693066b5385769a152d1a4deb4c9aa47763006ea4dd8a1ebbdb
---

# User Profile Setup

Ideal-example module for the "ideal example + clone" workflow. A self-contained,
layer-separated feature: a multi-step profile questionnaire with config loading,
event-driven state, backend integration, and a state-driven UI. Clone this
module's structure and conventions when building new features of the same shape.

## Architecture

1. "configuration" — static, framework-facing config. `constraints.ts` holds
   `FEATURE_NAME` and constants; `validation.ts` holds the error map and the
   react-hook-form field-config builder. No business logic, no state.
2. "domain" — pure domain types. `models.ts` uses `type` aliases, branded ids,
   and discriminated unions; `events.ts` is one `Event` union of `TriggerEvent`s.
   No transport, persistence, or React concerns.
3. "core" — state + business logic. `store.ts` (atoms/computed), `bus.ts`
   (event bus over the domain `Event`), `handlers/` (one file per trigger),
   `registry.ts` (wires handlers to the bus), `facade.ts` (actions + `use*`
   selectors), `mediator.ts` (composes store + registry + facade).
4. "integration" — backend boundary. `repository.ts` does `fetch` calls;
   `mappers.ts` maps backend DTOs to domain models. Nothing else fetches.
5. "presentation" — React only. `context.tsx` provides the facade via
   power-context, `router.tsx` switches views from state, plus view components.
   Components read state and call the facade; no business logic in JSX.
6. "**tests**" / "**e2e**" — component/unit tests (+ snapshots) and Playwright
   e2e specs.

## Code

1. Always `const`; always arrow functions.
2. Named exports only — no default exports.
3. Factory pattern: `createX(...)` returns an object; derive its type with
   `export type X = ReturnType<typeof createX>`.
4. Branded ids/keys: `type StepId = Brand<number, 'StepId'>`.
5. `type` aliases only — no `interface`, no `class`.
6. Entity variants are discriminated unions keyed by a literal `type`; exhaustive
   `switch` ends with a `const _: never = value` default.
7. Store atoms are `$`-prefixed; the facade exposes them as `use*` hooks.
8. Events are `[TRIGGER]_NAME` literals; handlers are RxJS
   `ofType('[TRIGGER]_X').pipe(tap(...))`.
9. Presentation reaches core only through the facade (actions + selectors).
10. Imports: `@/` alias for app-root modules; relative paths within this module.

## References

- [domain/models.ts](./domain/models.ts) — branded ids + discriminated unions.
- [domain/events.ts](./domain/events.ts) — the `TriggerEvent` union shape.
- [core/mediator.ts](./core/mediator.ts) — how store/registry/facade compose.
- [core/handlers/next.ts](./core/handlers/next.ts) — handler (RxJS) pattern.
- [core/facade.ts](./core/facade.ts) — actions + `use*` selector surface.
- [integration/mappers.ts](./integration/mappers.ts) — backend → domain mapping.
- [presentation/router.tsx](./presentation/router.tsx) — state-driven view switch.

> Read a reference only when the rule above is unclear.
