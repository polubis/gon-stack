Scalable frontend architecture guide.

1. Low coupling
2. High cohesion
3. Event driven architecture via available solution
4. Isolation > duplication
5. Application structure:

```md
src/
├── `__e2e__/` — e2e test setup
├── `__tests__/` — unit/integration test setup
├── `core/` — shell/bootstrap; wires app
├── `libs/` — generic non-app code
├── `modules/` — domain/feature slices
├── `(pages|routes)/` — framework routing (skip if no metaframework)
└── `shared/` — reusable domains; may hold server-client shared code
```

6. Modules structure `(modules|shared)/(name-of-domain)`:

```md
`__e2e__/` — end-to-end specs
└── `*.spec.*`
`__evals__/` — optional eval fixtures
└── `*.json`
`__log__/` — optional; per-task decisions + progress (repo root convention)
└── `{id}-{summary}.md` — template `templates/task-log.md`
`__tests__/` — unit/integration tests
└── `*.test.*`
`AGENTS.md` — module conventions + references via `templates/AGENTS.md`
`configuration/` — static config; no business logic, no state
├── `constraints.ts` — `FEATURE_NAME`, constants
└── `validation.ts` — form/error config (when needed)
`core/` — state + business logic; UI-agnostic
├── `actions/` — optional; reusable store mutations (dedupe handler logic)
│ └── `*.ts` — one action per cohesive store change
├── `bus.ts` — event bus over domain `Event` (EDA path)
├── `facade.ts` — triggers + state selectors
├── `handlers/` — one file per trigger; call `actions/` when shared
│ ├── `*.ts`
│ └── ...
├── `mediator.ts` — composes store + registry + facade
├── `registry.ts` — wires handlers to bus
└── `store.ts` — state + derived values
`domain/` — pure types; no UI, transport, or persistence
├── `events.ts` — typed event union
└── `models.ts` — branded ids, discriminated unions
`integration/` — backend boundary; nothing else fetches
├── `mappers.ts` — DTO → domain mapping
└── `repository.ts` — external/persistence calls
`presentation/` — UI only; read state + call facade
├── `connector.ts` — optional; glues all providers
├── `context.*` — provides facade via context
├── `main.*` — public entry
├── `router.*` — state-driven view switch
└── `*.*` — view components
```

## Examples

- `apps/romantic-app/src/modules/user-profile-setup`
