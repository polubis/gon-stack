#!/usr/bin/env bash
# Debian 13 factory user: account, ssh login, rootless Docker. Run as root. Re-run safe.
# Needs phase A (root key) + phase B (Docker, uidmap). Tooling (nvm, Node, pnpm) is next part.
# Env: FACTORY_USER=factory
set -Eeuo pipefail

FACTORY_USER="${FACTORY_USER:-factory}"

log() { printf '\n==> %s\n' "$*"; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "Run as root"
grep -qsE '^(ssh|ecdsa)-' /root/.ssh/authorized_keys || die "No root key. Run phase A first."
command -v dockerd-rootless-setuptool.sh >/dev/null 2>&1 || die "Docker missing. Run phase B first."
command -v newuidmap >/dev/null 2>&1 || die "uidmap missing. Run phase B first."

create_user() {
  log "User $FACTORY_USER"
  # No password, no sudo, no docker group: key login only
  id "$FACTORY_USER" >/dev/null 2>&1 ||
    useradd --create-home --shell /bin/bash --user-group "$FACTORY_USER"
  FACTORY_HOME="$(getent passwd "$FACTORY_USER" | cut -d: -f6)"
  [ -n "$FACTORY_HOME" ] || die "No home for $FACTORY_USER"
  local group
  group="$(id -gn "$FACTORY_USER")"
  install -d -m 0700 -o "$FACTORY_USER" -g "$group" "$FACTORY_HOME/.ssh"
  install -d -m 0750 -o "$FACTORY_USER" -g "$group" \
    "$FACTORY_HOME/workspaces" "$FACTORY_HOME/logs" "$FACTORY_HOME/config"
  # Same admin keys log in straight to factory
  install -m 0600 -o "$FACTORY_USER" -g "$group" \
    /root/.ssh/authorized_keys "$FACTORY_HOME/.ssh/authorized_keys"
}

write_env() {
  log "Shell env"
  local env_file="$FACTORY_HOME/.factory-env" marker="# factory-env"
  cat >"$env_file" <<'ENV'
export PATH="$HOME/.local/bin:$PATH"
export XDG_RUNTIME_DIR="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}"
[ -S "$XDG_RUNTIME_DIR/docker.sock" ] && export DOCKER_HOST="unix://$XDG_RUNTIME_DIR/docker.sock"
[ -f "$HOME/config/secrets.env" ] && . "$HOME/config/secrets.env"
ENV
  chown "$FACTORY_USER:$(id -gn "$FACTORY_USER")" "$env_file"
  # .bashrc returns early for non-interactive shells, so source on top of both
  local rc
  for rc in "$FACTORY_HOME/.bashrc" "$FACTORY_HOME/.profile"; do
    touch "$rc"
    grep -qF "$marker" "$rc" ||
      { printf '%s\n[ -f "$HOME/.factory-env" ] && . "$HOME/.factory-env"\n' "$marker"; cat "$rc"; } >"$rc.new"
    [ ! -f "$rc.new" ] || mv "$rc.new" "$rc"
    chown "$FACTORY_USER:$(id -gn "$FACTORY_USER")" "$rc"
  done
}

setup_rootless_docker() {
  log "Rootless Docker"
  local uid runtime tries=0
  uid="$(id -u "$FACTORY_USER")"
  runtime="/run/user/$uid"
  grep -q "^$FACTORY_USER:" /etc/subuid || usermod --add-subuids 100000-165535 "$FACTORY_USER"
  grep -q "^$FACTORY_USER:" /etc/subgid || usermod --add-subgids 100000-165535 "$FACTORY_USER"
  # Rootless daemon replaces the rootful one
  systemctl disable --now docker.service docker.socket 2>/dev/null || true
  # Keep user systemd alive without login
  loginctl enable-linger "$FACTORY_USER"
  until [ -S "$runtime/bus" ] || ((tries++ >= 20)); do sleep 0.5; done
  runuser -u "$FACTORY_USER" -- env \
    HOME="$FACTORY_HOME" XDG_RUNTIME_DIR="$runtime" \
    DBUS_SESSION_BUS_ADDRESS="unix:path=$runtime/bus" \
    dockerd-rootless-setuptool.sh install ||
    die "Rootless Docker setup failed (check: journalctl -u user@$uid)"
}

verify() {
  log "Verify"
  id "$FACTORY_USER"
  # Fails the script (non-zero) when factory cannot run containers
  runuser -l "$FACTORY_USER" -c '
    . ~/.factory-env
    for i in $(seq 1 15); do docker info >/dev/null 2>&1 && break; sleep 2; done
    docker run --rm hello-world >/dev/null && echo "[OK] rootless docker"
  ' || die "factory cannot run containers (rootless Docker)"
}

create_user
write_env
setup_rootless_docker
verify
echo "Factory user ready. Log in: ssh -i <key> $FACTORY_USER@<host>. Next: tooling."
