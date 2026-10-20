#!/usr/bin/env bash
#
# Software Factory - VPS bootstrap (Ubuntu / Debian)
#
# Run as root (or a sudo user). Two phases:
#   1. root:    system packages, Docker, GitHub CLI, firewall, SSH hardening,
#               `factory` account, secrets file
#   2. factory: nvm, Node, pnpm, Claude Code, OpenCode, herdr, repo clone,
#               fork + `fork` remote, deps, Playwright
#
# Pull-request model: the bot only forks the public repo and opens PRs.
# It has no write access to upstream. Push goes to its own fork over HTTPS.
#
# Usage (fresh VPS):
#   curl -fsSLO https://raw.githubusercontent.com/polubis/gon-stack/main/scripts/vps-setup.sh
#   GH_TOKEN=<bot token> bash vps-setup.sh
#
# Re-run safe. Without GH_TOKEN the repo is cloned read-only; set it and re-run
# to configure fork + push.
#
# Env:
#   GH_TOKEN=...            bot account classic PAT (public_repo); stored in
#                           <factory home>/config/secrets.env (0600), never in the repo
#   ANTHROPIC_API_KEY=...   optional, stored the same way
#   FACTORY_USER=factory
#   REPO_URL=https://github.com/polubis/gon-stack.git   (upstream, public)
#   REPO_DIR=<factory home>/workspaces/gon-stack
#   GIT_NAME="Software Factory"  GIT_EMAIL=<bot noreply address>
#   DEPLOY_KEY=0            1 = also generate an SSH key for SSH clones
#   INSTALL_DEPS=1          pnpm install --frozen-lockfile
#   INSTALL_PLAYWRIGHT=1    Chromium + system libs
#   ROOTLESS_DOCKER=1       Docker for factory without root on the host
#   HARDEN=1                ufw + key-only SSH (needs root authorized_keys)
#   SKIP_DOCKER=1  SKIP_AGENTS=1
#
set -Eeuo pipefail

FACTORY_USER="${FACTORY_USER:-factory}"
REPO_URL="${REPO_URL:-https://github.com/polubis/gon-stack.git}"
DEPLOY_KEY="${DEPLOY_KEY:-0}"
REPO_DIR="${REPO_DIR:-}"
GIT_NAME="${GIT_NAME:-Software Factory}"
GIT_EMAIL="${GIT_EMAIL:-factory@$(hostname -s)}"
INSTALL_DEPS="${INSTALL_DEPS:-1}"
INSTALL_PLAYWRIGHT="${INSTALL_PLAYWRIGHT:-1}"
ROOTLESS_DOCKER="${ROOTLESS_DOCKER:-1}"
HARDEN="${HARDEN:-1}"
SKIP_DOCKER="${SKIP_DOCKER:-0}"
SKIP_AGENTS="${SKIP_AGENTS:-0}"

# Published at https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/githubs-ssh-key-fingerprints
GITHUB_HOST_KEY="github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl"

log() { printf '\n==> %s\n' "$*"; }
warn() { printf 'WARNING: %s\n' "$*" >&2; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

# --------------------------------------------------
# Phase 2 - runs as the factory user (serialized via declare -f)
# --------------------------------------------------

user_phase() {
  local env_file="$HOME/.factory-env"
  local marker="# factory-env"

  mkdir -p "$HOME/workspaces" "$HOME/logs" "$HOME/config"

  log "Writing $env_file"
  cat >"$env_file" <<'EOF'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
export PATH="$HOME/.local/bin:$HOME/.opencode/bin:$PATH"
export XDG_RUNTIME_DIR="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}"
[ -S "$XDG_RUNTIME_DIR/docker.sock" ] && export DOCKER_HOST="unix://$XDG_RUNTIME_DIR/docker.sock"
[ -f "$HOME/config/secrets.env" ] && . "$HOME/config/secrets.env"
EOF

  # .bashrc returns early for non-interactive shells, so source on top.
  local rc
  for rc in "$HOME/.bashrc" "$HOME/.profile"; do
    touch "$rc"
    if ! grep -qF "$marker" "$rc"; then
      {
        # shellcheck disable=SC2016
        printf '%s\n[ -f "$HOME/.factory-env" ] && . "$HOME/.factory-env"\n' "$marker"
        cat "$rc"
      } >"$rc.new"
      mv "$rc.new" "$rc"
    fi
  done

  git config --global user.name "$GIT_NAME"
  git config --global user.email "$GIT_EMAIL"
  git config --global init.defaultBranch main
  git config --global pull.ff only
  git lfs install

  log "Installing Claude Code / OpenCode"
  if [[ "$SKIP_AGENTS" != "1" ]]; then
    export PATH="$HOME/.local/bin:$HOME/.opencode/bin:$PATH"
    if ! command -v claude >/dev/null 2>&1; then
      curl -fsSL https://claude.ai/install.sh | bash
    fi
    if ! command -v opencode >/dev/null 2>&1; then
      curl -fsSL https://opencode.ai/install | bash
    fi
  fi

  log "Installing herdr"
  export PATH="$HOME/.local/bin:$PATH"
  if ! command -v herdr >/dev/null 2>&1; then
    curl -fsSL https://herdr.dev/install.sh | sh
  fi

  log "Cloning repository"
  local cloned=0
  if [[ -d "$REPO_DIR/.git" ]]; then
    git -C "$REPO_DIR" pull --ff-only || warn "git pull failed"
    cloned=1
  elif git clone "$REPO_URL" "$REPO_DIR"; then
    cloned=1
  else
    warn "Clone failed - check REPO_URL and network, then re-run"
  fi

  # Bot flow: push to own fork, PR into upstream. Needs GH_TOKEN (from secrets.env).
  local slug
  slug="$(printf '%s' "$REPO_URL" | sed -E 's#^(https://github.com/|git@github.com:)##; s#\.git$##')"
  set +e
  # shellcheck source=/dev/null
  [ -f "$HOME/config/secrets.env" ] && . "$HOME/config/secrets.env"
  set -e
  if [[ $cloned == 1 && -n "${GH_TOKEN:-}" ]]; then
    log "Configuring fork of $slug"
    gh auth setup-git || warn "gh auth setup-git failed"
    if gh repo fork "$slug" --clone=false; then
      local bot
      bot="$(gh api user --jq .login)" || bot=""
      if [[ -n "$bot" ]] && ! git -C "$REPO_DIR" remote get-url fork >/dev/null 2>&1; then
        git -C "$REPO_DIR" remote add fork "https://github.com/$bot/${slug#*/}.git"
      fi
    else
      warn "Fork failed - check that GH_TOKEN is valid and has public_repo scope"
    fi
  fi

  # Versions come from the repo, so nvm/pnpm run after the clone.
  log "Installing nvm + Node + pnpm"
  export NVM_DIR="$HOME/.nvm"
  if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh |
      PROFILE=/dev/null bash
  fi

  # nvm.sh returns non-zero in places; keep it away from set -e.
  set +e
  # shellcheck source=/dev/null
  . "$NVM_DIR/nvm.sh"
  set -e

  local node_version="24" pnpm_version=""
  if [[ $cloned == 1 && -f "$REPO_DIR/.nvmrc" ]]; then
    node_version="$(tr -d '[:space:]v' <"$REPO_DIR/.nvmrc")"
  fi

  set +e
  nvm install "$node_version" && nvm alias default "$node_version" && nvm use "$node_version"
  local nvm_status=$?
  set -e
  [[ $nvm_status == 0 ]] || die "nvm could not install Node $node_version"

  if [[ $cloned == 1 && -f "$REPO_DIR/package.json" ]]; then
    pnpm_version="$(node -e '
      const v = require(process.argv[1]).packageManager || "";
      if (v.startsWith("pnpm@")) console.log(v.slice(5).split("+")[0]);
    ' "$REPO_DIR/package.json")"
  fi
  npm install -g "pnpm@${pnpm_version:-latest}"

  node --version
  pnpm --version

  if [[ $cloned == 1 && "$INSTALL_DEPS" == "1" ]]; then
    log "Installing repository dependencies"
    (cd "$REPO_DIR" && pnpm install --frozen-lockfile)

    if [[ "$INSTALL_PLAYWRIGHT" == "1" ]]; then
      log "Installing Playwright browser"
      (cd "$REPO_DIR" && pnpm exec playwright install chromium)
    fi
  fi
}

# --------------------------------------------------
# Phase 1 - root
# --------------------------------------------------

as_factory() {
  local payload
  payload="$(declare -f log warn die user_phase)
$(declare -p FACTORY_USER REPO_URL REPO_DIR GIT_NAME GIT_EMAIL INSTALL_DEPS INSTALL_PLAYWRIGHT SKIP_AGENTS)
set -Eeuo pipefail
user_phase"
  runuser -l "$FACTORY_USER" -c "bash -c $(printf '%q' "$payload")"
}

install_packages() {
  log "Installing system packages"
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y \
    ca-certificates curl wget git git-lfs gnupg jq unzip zip tar xz-utils \
    make gcc g++ build-essential python3 python3-pip python3-venv pkg-config \
    libvips-dev openssh-client openssl uidmap dbus-user-session slirp4netns \
    fuse-overlayfs iptables lsb-release ripgrep fd-find ufw fail2ban \
    unattended-upgrades
}

create_factory_user() {
  log "Configuring user $FACTORY_USER"
  if ! id "$FACTORY_USER" >/dev/null 2>&1; then
    useradd --create-home --shell /bin/bash --user-group "$FACTORY_USER"
  fi

  FACTORY_HOME="$(getent passwd "$FACTORY_USER" | cut -d: -f6)"
  [[ -n "$FACTORY_HOME" ]] || die "Could not resolve factory home"
  REPO_DIR="${REPO_DIR:-$FACTORY_HOME/workspaces/gon-stack}"

  local group
  group="$(id -gn "$FACTORY_USER")"
  install -d -m 0700 -o "$FACTORY_USER" -g "$group" "$FACTORY_HOME/.ssh"
  install -d -m 0750 -o "$FACTORY_USER" -g "$group" \
    "$FACTORY_HOME/workspaces" "$FACTORY_HOME/logs" "$FACTORY_HOME/config"

  # Same admin keys can log in straight to factory.
  if [[ -s /root/.ssh/authorized_keys ]]; then
    install -m 0600 -o "$FACTORY_USER" -g "$group" \
      /root/.ssh/authorized_keys "$FACTORY_HOME/.ssh/authorized_keys"
  fi

  if [[ "$DEPLOY_KEY" == "1" ]]; then
    if [[ ! -f "$FACTORY_HOME/.ssh/id_ed25519" ]]; then
      runuser -u "$FACTORY_USER" -- ssh-keygen -q -t ed25519 -N "" \
        -C "$FACTORY_USER@$(hostname -s)" -f "$FACTORY_HOME/.ssh/id_ed25519"
    fi

    grep -qF "$GITHUB_HOST_KEY" "$FACTORY_HOME/.ssh/known_hosts" 2>/dev/null ||
      echo "$GITHUB_HOST_KEY" >>"$FACTORY_HOME/.ssh/known_hosts"
    chown "$FACTORY_USER:$group" "$FACTORY_HOME/.ssh/known_hosts"
    chmod 0644 "$FACTORY_HOME/.ssh/known_hosts"
  fi

  # Secrets live outside the repo, readable by factory only. Only set vars are written.
  local secrets="$FACTORY_HOME/config/secrets.env"
  if [[ -n "${GH_TOKEN:-}" || -n "${ANTHROPIC_API_KEY:-}" ]]; then
    (
      umask 077
      : >"$secrets"
      [[ -z "${GH_TOKEN:-}" ]] || printf 'export GH_TOKEN=%q\n' "$GH_TOKEN" >>"$secrets"
      [[ -z "${ANTHROPIC_API_KEY:-}" ]] ||
        printf 'export ANTHROPIC_API_KEY=%q\n' "$ANTHROPIC_API_KEY" >>"$secrets"
    )
    chown "$FACTORY_USER:$group" "$secrets"
    chmod 0600 "$secrets"
  fi

  # No sudo, no docker group, no root-owned keys.
}

install_docker() {
  if [[ "$SKIP_DOCKER" == "1" ]]; then
    warn "Skipping Docker"
    return
  fi

  if ! command -v docker >/dev/null 2>&1; then
    log "Installing Docker Engine"
    local codename="${VERSION_CODENAME:-}"
    [[ "$ID" == "ubuntu" ]] && codename="${UBUNTU_CODENAME:-$codename}"
    [[ -n "$codename" ]] || die "Cannot detect distribution codename"

    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL "https://download.docker.com/linux/${ID}/gpg" -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc

    cat >/etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/${ID}
Suites: ${codename}
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

    apt-get update -qq
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
      docker-ce docker-ce-cli containerd.io docker-buildx-plugin \
      docker-compose-plugin docker-ce-rootless-extras
  fi

  [[ "$ROOTLESS_DOCKER" == "1" ]] || return 0
  log "Configuring rootless Docker for $FACTORY_USER"

  local uid
  uid="$(id -u "$FACTORY_USER")"
  grep -q "^$FACTORY_USER:" /etc/subuid ||
    usermod --add-subuids 100000-165535 "$FACTORY_USER"
  grep -q "^$FACTORY_USER:" /etc/subgid ||
    usermod --add-subgids 100000-165535 "$FACTORY_USER"

  # Rootless daemon replaces the rootful one.
  systemctl disable --now docker.service docker.socket 2>/dev/null || true

  loginctl enable-linger "$FACTORY_USER"
  local runtime="/run/user/$uid" tries=0
  until [[ -S "$runtime/bus" ]] || ((tries++ >= 20)); do sleep 0.5; done

  if ! runuser -u "$FACTORY_USER" -- env \
    HOME="$FACTORY_HOME" \
    XDG_RUNTIME_DIR="$runtime" \
    DBUS_SESSION_BUS_ADDRESS="unix:path=$runtime/bus" \
    dockerd-rootless-setuptool.sh install; then
    warn "Rootless Docker setup failed; on Ubuntu 24.04+ check AppArmor userns restrictions"
  fi
}

install_github_cli() {
  command -v gh >/dev/null 2>&1 && return
  log "Installing GitHub CLI"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    -o /etc/apt/keyrings/githubcli-archive-keyring.gpg
  chmod a+r /etc/apt/keyrings/githubcli-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
    >/etc/apt/sources.list.d/github-cli.list
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y gh
}

harden_host() {
  [[ "$HARDEN" == "1" ]] || return 0
  log "Hardening host"

  # Locking SSH to keys is only safe when a key already exists.
  if [[ ! -s /root/.ssh/authorized_keys ]]; then
    warn "No /root/.ssh/authorized_keys - skipping firewall and SSH hardening"
    return
  fi

  local port
  port="$(sshd -T 2>/dev/null | awk '$1 == "port" { print $2; exit }')"
  port="${port:-22}"

  ufw allow "$port/tcp" >/dev/null
  ufw --force enable >/dev/null

  cat >/etc/ssh/sshd_config.d/10-factory.conf <<EOF
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
EOF
  if sshd -t; then
    systemctl reload ssh 2>/dev/null || systemctl reload sshd 2>/dev/null || true
  else
    rm -f /etc/ssh/sshd_config.d/10-factory.conf
    warn "sshd config invalid - hardening reverted"
  fi

  systemctl enable --now fail2ban 2>/dev/null || true
  systemctl enable --now unattended-upgrades 2>/dev/null || true
}

install_playwright_deps() {
  [[ "$INSTALL_DEPS" == "1" && "$INSTALL_PLAYWRIGHT" == "1" ]] || return 0
  [[ -d "$REPO_DIR/node_modules" ]] || return 0
  log "Installing Playwright system libraries"

  local node_bin
  # shellcheck disable=SC2016
  node_bin="$(runuser -l "$FACTORY_USER" -c '. ~/.factory-env; dirname "$(command -v node)"')"
  (cd "$REPO_DIR" && PATH="$node_bin:$PATH" pnpm exec playwright install-deps chromium) ||
    warn "playwright install-deps failed"
}

verify_setup() {
  log "Verifying installation"
  # shellcheck disable=SC2016
  runuser -l "$FACTORY_USER" -c '
    . ~/.factory-env
    for cmd in git git-lfs curl jq node pnpm rg claude opencode herdr; do
      command -v "$cmd" >/dev/null 2>&1 && echo "[OK] $cmd" || echo "[MISSING] $cmd"
    done
    if command -v docker >/dev/null 2>&1; then
      docker run --rm hello-world >/dev/null 2>&1 &&
        echo "[OK] docker run hello-world" || echo "[WARN] docker cannot run containers"
    fi
  ' || true
  command -v gh >/dev/null 2>&1 && echo "[OK] gh" || echo "[MISSING] gh"

  cat <<EOF

========================================
 SOFTWARE FACTORY - VPS READY
========================================

User:  $FACTORY_USER
Home:  $FACTORY_HOME
Repo:  $REPO_DIR

1. $([[ -f "$FACTORY_HOME/config/secrets.env" ]] && grep -q GH_TOKEN "$FACTORY_HOME/config/secrets.env" \
  && echo "GH_TOKEN stored in $FACTORY_HOME/config/secrets.env; fork remote: git -C $REPO_DIR remote -v" \
  || echo "No GH_TOKEN yet: re-run with GH_TOKEN=<bot token> to configure fork + push")
   Open a PR from the bot fork:
   git switch -c <branch> && git push -u fork <branch> && gh pr create --repo $(printf '%s' "$REPO_URL" | sed -E 's#^(https://github.com/|git@github.com:)##; s#\.git$##')

2. Log in and authenticate once per tool:
   ssh $FACTORY_USER@<host>      (or: sudo -iu $FACTORY_USER)
   claude
   opencode auth login

3. Supabase (local, reach Studio/API through an SSH tunnel):
   cd $REPO_DIR/apps/parka && pnpm db:start
   ssh -L 54321:localhost:54321 -L 54323:localhost:54323 $FACTORY_USER@<host>
   If \`vector\` fails to start, set [analytics] enabled = false in supabase/config.toml

Docker: $([[ "$ROOTLESS_DOCKER" == "1" && "$SKIP_DOCKER" != "1" ]] && echo "rootless, owned by $FACTORY_USER (system daemon disabled)" || echo "rootful, $FACTORY_USER has no access")
========================================
EOF
}

main() {
  if [[ $EUID -ne 0 ]]; then
    command -v sudo >/dev/null || die "Run as root or install sudo"
    exec sudo -E bash "$0" "$@"
  fi

  [[ -f /etc/os-release ]] || die "Unsupported operating system"
  # shellcheck source=/dev/null
  source /etc/os-release
  case "$ID" in
    ubuntu | debian) ;;
    *) die "Only Ubuntu and Debian are supported" ;;
  esac

  install_packages
  create_factory_user
  install_docker
  install_github_cli
  as_factory
  install_playwright_deps
  harden_host
  verify_setup
}

main "$@"
