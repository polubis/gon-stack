#!/usr/bin/env bash
# Debian 13 root setup: packages, Docker Engine, GitHub CLI, firewall. Run as root. Re-run safe.
# No factory user here (next part). Run phase A first (key login must work).
set -Eeuo pipefail

# Keep in sync with @playwright/test in pnpm-workspace.yaml catalog (or "latest")
PLAYWRIGHT_VERSION="${PLAYWRIGHT_VERSION:-1.64.0}"

log() { printf '\n==> %s\n' "$*"; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "Run as root"
[ -f /etc/os-release ] || die "No /etc/os-release"
# shellcheck source=/dev/null
. /etc/os-release
[ "$ID" = "debian" ] || die "Debian only"
export DEBIAN_FRONTEND=noninteractive

install_packages() {
  log "System packages"
  apt-get update -qq
  apt-get install -y \
    ca-certificates curl wget git git-lfs gnupg jq unzip zip tar xz-utils lsb-release \
    openssh-client openssl make gcc g++ build-essential pkg-config \
    python3 python3-pip python3-venv libvips-dev \
    uidmap dbus-user-session slirp4netns fuse-overlayfs iptables \
    ripgrep fd-find ufw fail2ban unattended-upgrades
}

install_docker() {
  command -v docker >/dev/null 2>&1 && { log "Docker present"; return; }
  log "Docker Engine"
  [ -n "${VERSION_CODENAME:-}" ] || die "No codename"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL "https://download.docker.com/linux/${ID}/gpg" -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  cat >/etc/apt/sources.list.d/docker.sources <<DOCKER
Types: deb
URIs: https://download.docker.com/linux/${ID}
Suites: ${VERSION_CODENAME}
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
DOCKER
  apt-get update -qq
  apt-get install -y docker-ce docker-ce-cli containerd.io \
    docker-buildx-plugin docker-compose-plugin docker-ce-rootless-extras
  # Make sure the daemon runs (phase C switches to rootless later)
  systemctl enable --now docker
}

install_github_cli() {
  command -v gh >/dev/null 2>&1 && { log "gh present"; return; }
  log "GitHub CLI"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    -o /etc/apt/keyrings/githubcli-archive-keyring.gpg
  chmod a+r /etc/apt/keyrings/githubcli-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
    >/etc/apt/sources.list.d/github-cli.list
  apt-get update -qq
  apt-get install -y gh
}

install_playwright_deps() {
  log "Playwright system libs ($PLAYWRIGHT_VERSION)"
  # Playwright owns the lib list. Temporary Node from apt, removed after
  local tmp_node=0
  if ! command -v npx >/dev/null 2>&1; then
    apt-get install -y nodejs npm
    tmp_node=1
  fi
  npx --yes "playwright@$PLAYWRIGHT_VERSION" install-deps chromium
  if [ "$tmp_node" = 1 ]; then
    apt-get purge -y nodejs npm
    apt-get autoremove -y
  fi
}

harden_host() {
  log "Firewall + fail2ban + auto updates"
  # Lockout guard: firewall only with key login in place
  grep -qsE '^(ssh|ecdsa)-' /root/.ssh/authorized_keys ||
    die "No key in /root/.ssh/authorized_keys. Run phase A first."
  local port
  port="$(sshd -T 2>/dev/null | awk '$1 == "port" { print $2; exit }')"
  ufw allow "${port:-22}/tcp" >/dev/null
  ufw --force enable >/dev/null
  systemctl enable --now fail2ban
  systemctl enable --now unattended-upgrades
}

verify() {
  log "Verify"
  for cmd in git git-lfs curl jq rg gcc make python3 docker gh ufw fail2ban-client; do
    command -v "$cmd" >/dev/null 2>&1 && echo "[OK] $cmd" || echo "[MISSING] $cmd"
  done
  if ! systemctl is-enabled --quiet docker; then
    # Re-run after phase C: root daemon is off on purpose
    echo "[SKIP] root docker run (root daemon disabled, rootless in use)"
  else
    # Daemon may need a few seconds after install
    local i out
    for i in $(seq 1 15); do docker info >/dev/null 2>&1 && break; sleep 2; done
    if out="$(docker run --rm hello-world 2>&1)"; then
      echo "[OK] docker run"
    else
      echo "[WARN] docker run failed:"
      printf '%s\n' "$out" | tail -3
    fi
  fi
  ufw status | head -5
}

install_packages
install_docker
install_github_cli
install_playwright_deps
harden_host
verify
echo "Root setup done. Next: factory user."
