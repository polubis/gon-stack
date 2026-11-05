---
name: vps-gon-stack
description: >
  Debian 13 VPS full setup via one script (main.sh) run after first root ssh login: key-only ssh,
  root packages, Docker, gh, Playwright libs, firewall, factory user + rootless Docker,
  factory tooling (nvm, Node, pnpm, repo, Playwright browser, herdr, Claude Code, opencode).
  Use when user says "vps setup", "debian 13 vps", "harden ssh", "disable ssh password",
  or invokes /vps-gon-stack.
---

# VPS Debian 13

Basic path: 2 manual steps (key + first login), then [scripts/main.sh](scripts/main.sh) does everything else.

## 1. Before main.sh (manual, local)

1. Make ssh key on your machine (not VPS). SET PASSPHRASE.

```powershell
# New ssh key
ssh-keygen -t ed25519 -C "somemail@gmail.com" -f "$env:USERPROFILE\.ssh\id_ed25519_new"
# Pub key to clipboard
Get-Content "$env:USERPROFILE\.ssh\id_ed25519_new.pub" | Set-Clipboard
```

2. Paste pub key into VPS provider panel.

3. First login with the key. Confirm fingerprint "yes" only if IP/domain valid, else STOP.

```powershell
ssh -i "$env:USERPROFILE\.ssh\id_ed25519_new" root@1.1.1.1
```

## 2. Run main.sh

Runs in order, stops on first error, re-run safe (connection dropped = run again):

- **A** ssh hardening: key-only login (`harden-ssh.sh`)
- **B** root setup: packages, Docker, gh, Playwright libs, firewall (`setup-root.sh`)
- **C** `factory` user + rootless Docker (`setup-factory.sh`)
- **D** as `factory`: nvm, Node, pnpm, repo clone, deps, Playwright browser, herdr installed not started, Claude Code and opencode installed not signed in (`setup-tools.sh`)
- **E** as `factory`: `.env` for every app with a database (`parka`, `romantic-app`, `talent-orbit`), one by one, from its `.env.example` (`setup-env.sh`). For each app Supabase is started only to read its public keys and stopped right after, nothing keeps running (start one yourself: `cd apps/<app> && pnpm db:start`, same ports so one at a time). VAPID pair is generated, AI key is a dummy `<random>-mock`. An existing `.env` is never opened or changed (that app is skipped); only names are logged, never values. If a Supabase cannot start, the other apps are still done, then the step fails with the list of problems.

`main.sh` calls its sibling scripts, so copy the whole `scripts/` dir to the VPS.

```powershell
# Local machine. Go to this skill dir (change path to yours)
cd C:\Users\john\gon-stack\.nitpick\skills\vps-gon-stack
# Copy scripts to the VPS
scp -i "$env:USERPROFILE\.ssh\id_ed25519_new" -r .\scripts root@1.1.1.1:/root/vps-setup
# Run all. sed strips Windows CR from the copied scripts first
ssh -i "$env:USERPROFILE\.ssh\id_ed25519_new" root@1.1.1.1 "sed -i 's/\r//g' /root/vps-setup/*.sh && bash /root/vps-setup/main.sh"
```

Optional env before `bash`: `FACTORY_USER`, `REPO_URL`, `GIT_NAME`, `GIT_EMAIL`, `PLAYWRIGHT_VERSION` (keep equal to catalog `@playwright/test`), `SKIP_SUPABASE=1` (phase E uses template values only, does not start Supabase).

On VPS directly (scripts already there): `bash main.sh`

## 3. After

1. Test login in a NEW terminal: `ssh -i "$env:USERPROFILE\.ssh\id_ed25519_new" factory@1.1.1.1`
2. Sign in to Claude Code and opencode yourself as `factory` (`claude`, `opencode auth login`). Never via script/chat.
3. As `factory` create `~/config/secrets.env` (0600) by hand if you need `GH_TOKEN` etc. Never via script/chat.
4. Remove the copy on VPS: `rm -rf /root/vps-setup`

## More context

- [references/manual-steps.md](references/manual-steps.md): each phase step by step with manual commands (comments on every command), per-phase scripts, run one phase alone, debug.
