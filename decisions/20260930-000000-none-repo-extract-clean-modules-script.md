---
ticket: none
scope: repo
summary: Extract clean:modules script
why: Allow wiping `node_modules` without deleting the lockfile or reinstalling
date: 2026-09-30
---

- Extracted Turbo daemon stop and `node_modules` removal from `clean-install.sh` into `clean-modules.sh`, exposed as `pnpm clean:modules`.
- `clean-install.sh` now calls `clean-modules.sh`, then removes `pnpm-lock.yaml` and runs `pnpm install`.
- Behavior of `clean:install` unchanged; scripts checked for syntax only, not executed.
