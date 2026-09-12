---
id: 0001
document: 0001-full-e2e-id-migration.md
module: __e2e__
status: accepted
---

# 0001 — full per-module e2e ids + partial dynamic suffixes

Ask: migrate all parka `data-e2e` selectors off `` `module:${string}` `` wildcards to per-module `configuration/e2e-ids.ts`, with partial type-safe dynamic ids per `core.md` rule 5.

Fix: each module (and `shared/cookies`) owns static ids in `as const` arrays; repeated DOM nodes use `` `prefix:name:${string | number}` `` suffixes (rows, receipt item fields, statistics range tabs). Root `selectors.d.ts` unions imported module types only — no wildcards, no inline cookie literals.

Dynamic ids in DOM: `expenses:row`, `categories:row`, `recurring:row`, `statistics:range`, `receipt:item-*` → suffixed with entity id or range key.

E2E specs targeting receipt item inputs use regex prefix (`/^receipt:item-name:/`) because item ids are runtime-generated.

Consequence: typos in static ids fail compile; dynamic ids require correct prefix + suffix shape, not arbitrary strings.
