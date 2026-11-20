---
ticket: none
scope: repo
summary: Add ecosystem-resources with port registry and reset
why: Clashing Supabase and dev ports plus stale state caused white pages; one validated registry and one reset command make starts predictable
date: 2026-11-20
---

- New package `@repo/ecosystem-resources`: typed port registry in `src/ports.ts`, dedicated range per group, unique ports, validated when the config loads
  - Groups: dev 43xx, e2e 44xx, one Supabase block per app (54100, 54200, 54300)
  - Overlap, duplicate, out-of-range and privileged ports throw with every problem listed
- Supabase `config.toml` and `.env.example` are generated from the registry: `pnpm ecosystem:sync`, drift fails `pnpm ecosystem:check` and a unit test
- `pnpm reset` (`.ecosystem/config.ts`): cleans `.evidences` and Playwright output, runs `supabase stop --no-backup` per app, kills every registry port, verifies they are free
  - `--dry-run` previews; factory lock and own process chain are never removed or killed
  - Runs from sources with node built-ins only, so it works on a broken install
- Astro dev uses `strictPort` on registry ports, Playwright and test setups read the same registry
- Nitpick: rule "main agent only runs `pnpm reset` before any work", subagents never; ports registry rule; project map and VPS guide ports updated
