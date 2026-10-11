---
ticket: none
scope: parka/dashboard
summary: EDA layered dashboard module
why: Prior dashboard mixed orchestration in presentation/hook; need cloneable layout matching `references/frontend-architecture.md`
date: 2026-09-16
---

- Rebuild Parka `dashboard` as ideal-example EDA slice: `configuration/constraints.ts`;
  - `domain/{models,events}.ts`
  - `core/{store,bus,handlers/load-summary,registry,facade,mediator}.ts`
  - `integration/{mappers,repository}.ts`
  - `presentation/{context,main,quick-action-icon}`.
- Add module `AGENTS.md` + stamp in `hashy.modules.txt`.
- Wire UI via context/facade (local mapper vs backend repository by mode).
- Consequence: new overview features copy this module’s layers + `AGENTS.md` conventions.
