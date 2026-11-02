---
ticket: none
scope: nitpick
summary: Config option generates Claude Code settings and .mcp.json
why: Project Claude settings and MCP servers should stay in sync from one config instead of hand-edited files
date: 2026-10-12
tags: [config, settings, mcp]
---

- New optional inline `settings` in `.nitpick/config.ts`: `name`, `permissions`, `hooks`, `env`, passthrough keys, `mcp`
  - `--sync` writes `<name>` under the first `output` entry as deterministic JSON; `--check` reports it via existing `[sync]` out-of-date flow
  - `mcp` also writes root `.mcp.json` and adds `enabledMcpjsonServers` to settings
- Config errors (exit 3): literal-looking secrets in `env` / `headers` without `${VAR}`, invalid `name`, empty server name
- Logic in `src/settings.ts`, wired in `docs.ts`; tests in docs and run suites, README updated
- Repo wiring: `.nitpick/config.ts` sets `settings` with playwright/a11y MCP, their permissions and empty attribution
  - Generates `.ai/settings.json` (first output) and `.mcp.json`
