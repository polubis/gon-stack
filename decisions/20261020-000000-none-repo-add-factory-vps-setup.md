---
ticket: none
scope: repo
summary: Rewrite VPS setup script for software factory
why: Old script installed tools for the admin user only, so the factory account had nothing and the repo could not be pulled unattended
date: 2026-10-20
tags: [vps, scripts, factory]
---

- Rewrite `scripts/vps-setup.sh` as two phases: root (packages, Docker, gh, ufw, key-only SSH, `factory` user) and `factory` (nvm, Node, pnpm, Claude, OpenCode, herdr, clone, deps, Playwright)
  - Node and pnpm versions read from cloned `.nvmrc` and `packageManager`
  - Bot PR model: clone upstream over HTTPS, `GH_TOKEN` (classic PAT, `public_repo`) in `config/secrets.env` 0600, fork + `fork` remote via `gh`; no upstream write
  - SSH deploy key only with `DEPLOY_KEY=1`
  - Rootless Docker for `factory`, system daemon disabled; `ROOTLESS_DOCKER=0` keeps rootful
  - Re-run safe; failed clone only warns
- Add `scripts/test-vps-setup.sh`: runs the setup twice in a throwaway `ubuntu:24.04` container and asserts the `factory` toolchain
  - Rootless Docker, ufw and SSH hardening need a real host and stay untested here
