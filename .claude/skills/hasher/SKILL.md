---
name: hasher
description: Sync a module's AGENTS.md with its code after `nitpick hash` reports a change vs. the last ideal example. Trigger on "hasher", "nitpick hash failed", "update AGENTS.md", "doc drift", "change detected vs last ideal example".
---

## ROLE

Bring the doc next to a changed target back in line with its code, then stamp.
The `nitpick` CLI owns hashing; never edit `hash:` by hand.

## FLOW

1. Build + check: `pnpm --filter @repo/nitpick build && node packages/nitpick/dist/cli.js hash [path]`
2. On FAIL, read the target (dir or file) and its doc (path printed in error).
3. Update the doc so it matches the code: only rules/structure that really changed.
4. Show the doc diff to the user; iterate until accepted.
5. Stamp: `node packages/nitpick/dist/cli.js hash <path> --write`
6. Re-run step 1; report pass.

## CONFIG

`nitpick.config.mts` (repo root, `defineConfig`) → `hash` → `targets` (`path` exact, or `match` RegExp on
dirs; optional `doc`, `include`, `exclude` RegExp[]). Add new targets there.

## RULES

- Doc lives next to the target (default `AGENTS.md`); frontmatter keeps only `hash`.
- No stamping before the user accepts the doc update.
- Minimal doc edits; describe style/architecture, not line-level detail.
