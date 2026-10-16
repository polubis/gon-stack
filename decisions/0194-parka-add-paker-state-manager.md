---
ticket: none
scope: parka
summary: Add @repo/paker reactive state manager package
why: Parka modules need a tiny store without Redux or XState boilerplate
date: 2026-10-16
---

- New `packages/paker` (`@repo/paker`): `value`, `store`, `actions`, optional RxJS adapter
  - Subpath exports only, zero runtime deps, React hooks via `useSyncExternalStore`
- Vitest coverage for values, stores, actions, integration, and RxJS forwarding
