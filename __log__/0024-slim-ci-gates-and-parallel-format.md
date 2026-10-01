# 0024 - Slim CI gates, parallel root format check, turbo agent guidance off

```json
{
  "status": "done"
}
```

Removed `deps:audit`, `deps:outdated` and `hash:check` from `ci:verify`, `ci:verify:dry`, PR CI and Parka deploy `verify` (scripts remain for manual use). Format check now runs as the root turbo task `//#format:check` in the same turbo run as lint/types/tests (CI adds `--filter=//`), so it no longer blocks them. Added `pnpm-lock.yaml` to `.prettierignore` (generated). Set `"agentGuidance": false` in `turbo.json` and deleted the root `AGENTS.md` that turbo generated.

Audit/outdated/hash gates were noisy and unrelated to current work; format in parallel cuts wall time. Supersedes the CI-gate part of 0022.
