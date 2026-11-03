---
ticket: none
scope: nitpick
summary: Statusline plugin with model, context and limit shares
why: Status line needs config-driven settings, compiled per machine; bar shows only model with context, daily and limit shares
date: 2026-11-03
tags: [nitpick, statusline, plugins]
---

- Config `plugins: [{ id, settings }]`, merged into settings files; plugin sets own `name` (settings.json or settings.local.json)
  - Same key from config and plugin, or two plugins: config error (exit 3)
  - Duplicate plugin id: `config()` throws
- Built-in `statusLine({ limits })` from `@repo/nitpick/plugins/statusline`, writes `statusLine` to `settings.local.json`
  - Command points to compiled `dist/plugins/statusline-bin.js`, absolute, so per machine
- Bar format, one line: `Haiku 5.5 ◔ 43% | $3.96/1.2M | td 20%/1.2M | wk 66%/3.1M`
  - Model with context gauge `○ ◔ ◑ ◕ ●` and percent of window; green up to 50%, yellow up to 60%, red above
  - Daily cost in dollars and daily tokens in millions, no limit shown
  - `td` and `wk`: share of daily and weekly limit (cost / limit) and tokens in millions; `-` without limit
- Daily and weekly cost from `~/.claude/projects` transcripts (`cost-state` counters); tokens are input + output, deduped by message id
  - Incremental scan: byte offset per transcript in `~/.claude/cache/nitpick-statusline.json`
- Limits are USD set in config, not read from plan; gon-stack enables daily 20, weekly 100 (placeholders)
- Context read from stdin `context_window`: `used_percentage`, fallback `current_usage` over `context_window_size`
- Removed from bar: session cost, context tokens, per-file counts (kept out of scope by request)
- Pure modules `statusline-context.ts`, `statusline-usage.ts`, `statusline-render.ts`; 100% coverage gate kept
