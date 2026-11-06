---
ticket: none
scope: repo
summary: Audit shell fix on Windows, drop worktree gitlink, add clean scripts
why: pnpm.cmd needs a shell to spawn, so the audit gate failed closed on Windows and blocked commits
date: 2026-11-08
---

- `scripts/audit.mjs`: `spawnSync` with `shell: true` so `pnpm` resolves to `pnpm.cmd` on Windows
- Removed accidentally committed `.worktrees/remove-hashy` gitlink (mode 160000)
- Added `clean:turbo` (stops daemon, removes `.turbo`) and `clean:all` (turbo then modules) scripts with `clean-turbo.sh` and `clean-all.sh`
