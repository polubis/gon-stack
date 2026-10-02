# 0026 - Drop audit, outdated, log-existence and hash checks and hashy

```json
{
  "status": "done"
}
```

Removed every non-functional gate: `deps:audit`, `deps:outdated`, `ci:security`, `ci:check-updates` (pre-push outdated check), `log:check` + `scripts/log-check.mjs` (PR CI step, `ci:verify`, `ci:verify:dry`) and `hash:*` scripts. Deleted `packages/hashy`, `hashy.modules.txt`, the `hashy` skill and all `AGENTS.md` it stamped (every `apps/**` module doc). Dropped hashy steps from `document-module`, `feature-workflow`, `templates/AGENTS.md` and `CLAUDE.md`. Pre-push runs `pnpm ci:verify` only; PR CI keeps format, lint, types and tests. `ncu` helpers (`check-deps`, `update-deps*`) stay for manual use. Session logs in `__log__` are still written (`rules/general.md`), just no longer enforced by CI.

Audit, outdated, log-existence and hash gates added friction without protecting anything. Supersedes 0011, 0022 and 0024 (CI-gate parts).
