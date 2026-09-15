# Frontend architecture guide

The guide how to create frontend solutions in scalable way

## Application architecture

1. Prefer low coupling
2. Prefer high cohesion
3. Use EDA (either when overkill via detected "EDA pattern" in app)
4. Use following application structure
5. Isolation more important than coupling
6. Follow structure:

```md
`modules` (domain sliced directories/feature slicing)
`shared` (re-usable domains, may contain server-client shared code)
`libs` (generic non-app related code)
`core` (shell, bootstrap layer that wires everything)
`__tests__` (setup for unit/integration tests)
`__e2e__` (setup for e2e tests)
`(pages/app-router)` -> per framework (optional if no metaframework)
```

7. `shared/modules` directories architecture

```md
`shared/modules`
`name-of-domain`
`index.ts` -> single entry point (explict re-export of public API)
`presentation` -> plain React/Angular -> nothign more than UI logic/presentation
`core` -> main logic of feature
`integration` -> integrationg/mapping with external data sources
`domain` -> domain models, events definitions, plain TS + business logic
```

## References/Examples

1. apps\romantic-app\src\modules\user-profile-setup
