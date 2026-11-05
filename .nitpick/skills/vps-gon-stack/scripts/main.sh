#!/usr/bin/env bash
# Debian 13 full setup, run as root AFTER the first ssh key login. Re-run safe.
# Order: A ssh hardening -> B root setup -> C factory user -> D factory tooling -> E .env files.
# Needs the sibling scripts in the same directory.
# Env (optional): FACTORY_USER, REPO_URL, GIT_NAME, GIT_EMAIL, PLAYWRIGHT_VERSION, SKIP_SUPABASE=1
set -Eeuo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FACTORY_USER="${FACTORY_USER:-factory}"
export FACTORY_USER

log() { printf '\n########## %s\n' "$*"; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "Run as root"
for f in harden-ssh.sh setup-root.sh setup-factory.sh setup-tools.sh setup-env.sh; do
  [ -f "$DIR/$f" ] || die "Missing $DIR/$f"
done

log "A: SSH hardening (key-only login)"
bash "$DIR/harden-ssh.sh"

log "B: root setup (packages, Docker, gh, Playwright libs, firewall)"
bash "$DIR/setup-root.sh"

log "C: $FACTORY_USER user + rootless Docker"
bash "$DIR/setup-factory.sh"

# Login shell as factory. -w keeps the listed vars. Script comes via stdin (factory cannot read /root)
log "D: tooling as $FACTORY_USER (nvm, Node, pnpm, repo, Playwright browser, herdr, Claude Code, opencode)"
runuser -w REPO_URL,GIT_NAME,GIT_EMAIL -l "$FACTORY_USER" -c "bash -s" <"$DIR/setup-tools.sh"

log "E: .env files for every app with a database, as $FACTORY_USER (each Supabase is started only to read its keys, then stopped. SKIP_SUPABASE=1 skips it)"
runuser -w SKIP_SUPABASE -l "$FACTORY_USER" -c "bash -s" <"$DIR/setup-env.sh"

cat <<DONE

########## ALL DONE
1. Test login in a NEW terminal: ssh -i <key> $FACTORY_USER@<host>
2. As $FACTORY_USER create ~/config/secrets.env (0600) if you need GH_TOKEN etc.
3. Repo: ~/workspaces/gon-stack (herdr installed, not started; Claude Code and opencode installed, not signed in: run claude / opencode as $FACTORY_USER)
4. apps/*/.env created for parka, romantic-app, talent-orbit (mock AI key, generated VAPID pair). No Supabase is running: start one with "cd apps/<app> && pnpm db:start" (same ports, one at a time)
DONE
