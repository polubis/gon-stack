---
title: EDA Architecture for Scalable Frontend Modules
impact: HIGH
impactDescription: Low coupling, typed event flow, isolated layers per domain module
tags: eda, architecture, modules, event-driven, frontend
---

# Eda architecture

Scalable frontend layout guide.

## App architecture

1. Low coupling
2. High cohesion
3. Event driven architecture via available solution
4. Isolation > duplication
5. Root layout:

```md
`modules` — domain/feature slices
`shared` — reusable domains; may hold server-client shared code
`libs` — generic non-app code
`core` — shell/bootstrap; wires app
`__tests__` — unit/integration test setup
`__e2e__` — e2e test setup
`(pages/app-router)` — framework routing (skip if no metaframework)
```

6. `shared/modules` per domain:

```md
`shared/modules`
`name-of-domain`
`index.ts` — single public API entry; explicit re-exports only
`presentation` — React/Angular UI only; no business logic
`core` — feature logic
`integration` — external data mapping
`domain` — models, events, plain TS business rules
```

## Examples

- `apps/romantic-app/src/modules/user-profile-setup`
