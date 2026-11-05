---
ticket: none
scope: nitpick
summary: Add vps-gon-stack skill for Debian 13 VPS setup via main.sh
why: One run after first root ssh login replaces manual VPS setup; old scripts/vps-setup.sh and test-vps-setup.sh are gone
date: 2026-11-04
---

- Skill `.nitpick/skills/vps-gon-stack`: `SKILL.md` is the basic path, `references/manual-steps.md` has every step by hand
- `scripts/main.sh` runs phases in order, stops on first error, re-run safe
  - A `harden-ssh.sh`: key-only ssh, lockout guard
  - B `setup-root.sh`: packages, Docker, gh, Playwright libs via `playwright install-deps`, ufw, fail2ban, unattended-upgrades
  - C `setup-factory.sh`: non-root `factory` user, rootless Docker, dies on failure
  - D `setup-tools.sh`: git, nvm, Node from `.nvmrc`, pnpm, repo clone, deps, Playwright chromium, herdr, Claude Code, opencode
  - E `setup-env.sh`: `.env` per app with a database, one by one
- herdr, Claude Code and opencode are installed only: never started, never signed in
- Playwright system libs come from Playwright's own installer, no hand-kept package list
- Phase E starts each local Supabase only to read its public keys, then stops it: nothing keeps running
  - Existing `.env` is never opened; names are logged, never values; file mode 600
  - Empty VAPID keys get a generated pair, empty `*_API_KEY` gets `<hex>-mock`
  - Supabase start failure: other apps are still done, then exit is non-zero with the list
- Added `.env.example` for `romantic-app` and `talent-orbit`; fixed wrong publishable key in `parka`
- `romantic-app` supabase config: `[inbucket]` to `[local_smtp]`, CLI 2.120 rejects the old section
- `parka` popover-modal e2e: `Dodaj` button selector is `exact: true` (substring matched `Dodaj kategorię`)
- Verified in a fresh Debian 13 container: A-E exit 0, re-run exit 0, e2e parka, romantic-app, talent-orbit pass
  - Not tested on a real VPS; `AUTH_CALLBACK_URL` is an unverified placeholder
  - Container-only workarounds (legacy iptables, `modules.builtin`, volumes) are not in the scripts
