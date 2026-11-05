#!/usr/bin/env bash
# Debian 13 factory tooling: git, nvm, Node, pnpm, repo, deps, Playwright browser.
# Run as factory (NOT root). Needs phase B + C. Re-run safe. No secrets here.
# Env: REPO_URL, GIT_NAME, GIT_EMAIL
set -Eeuo pipefail

REPO_URL="${REPO_URL:-https://github.com/polubis/gon-stack.git}"
GIT_NAME="${GIT_NAME:-Software Factory}"
GIT_EMAIL="${GIT_EMAIL:-factory@$(hostname -s)}"
NVM_VERSION="v0.40.3"
NVM_DIR="$HOME/.nvm"
REPO_DIR="$HOME/workspaces/gon-stack"

log() { printf '\n==> %s\n' "$*"; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

setup_git() {
  log "Git defaults"
  git config --global user.name "$GIT_NAME"
  git config --global user.email "$GIT_EMAIL"
  git config --global init.defaultBranch main
  git config --global pull.ff only
  git lfs install
}

clone_repo() {
  log "Repository"
  mkdir -p "$HOME/workspaces"
  if [ -d "$REPO_DIR/.git" ]; then
    git -C "$REPO_DIR" pull --ff-only
  else
    git clone "$REPO_URL" "$REPO_DIR"
  fi
}

install_node() {
  log "nvm + Node"
  if [ ! -s "$NVM_DIR/nvm.sh" ]; then
    curl -fsSL "https://raw.githubusercontent.com/nvm-sh/nvm/$NVM_VERSION/install.sh" |
      PROFILE=/dev/null bash
  fi
  # nvm env for new shells (once)
  grep -qF 'NVM_DIR' "$HOME/.factory-env" ||
    cat >>"$HOME/.factory-env" <<'ENV'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
ENV
  # nvm.sh is not safe under set -eu
  set +eu
  # shellcheck source=/dev/null
  . "$NVM_DIR/nvm.sh"
  set -eu
  # Version comes from the repo, never hardcoded here
  local node_version
  node_version="$(tr -d '[:space:]v' <"$REPO_DIR/.nvmrc")"
  set +e
  nvm install "$node_version" && nvm alias default "$node_version" && nvm use "$node_version"
  local status=$?
  set -e
  [ "$status" -eq 0 ] || die "nvm could not install Node $node_version"
}

install_pnpm() {
  log "pnpm"
  local version
  version="$(node -e '
    const v = require(process.argv[1]).packageManager || "";
    if (v.startsWith("pnpm@")) console.log(v.slice(5).split("+")[0]);
  ' "$REPO_DIR/package.json")"
  [ -n "$version" ] || die "No pnpm in packageManager"
  npm install -g "pnpm@$version"
}

install_repo_deps() {
  log "Dependencies + Playwright browser"
  cd "$REPO_DIR"
  CI=true pnpm install --frozen-lockfile </dev/null
  # Browser only. System libs were installed in phase B
  pnpm exec playwright install chromium </dev/null
}

install_herdr() {
  log "herdr (install only, not started)"
  command -v herdr >/dev/null 2>&1 && return
  curl -fsSL https://herdr.dev/install.sh | sh
}

install_claude_code() {
  log "Claude Code (install only, no sign-in)"
  command -v claude >/dev/null 2>&1 && return
  # Native installer: binary in ~/.local/bin, no Node needed
  curl -fsSL https://claude.ai/install.sh | bash
}

install_opencode() {
  log "opencode (install only, no sign-in)"
  # Installer puts the binary in ~/.opencode/bin. PATH comes from ~/.factory-env (once)
  grep -qF '.opencode/bin' "$HOME/.factory-env" ||
    echo 'export PATH="$HOME/.opencode/bin:$PATH"' >>"$HOME/.factory-env"
  export PATH="$HOME/.opencode/bin:$PATH"
  command -v opencode >/dev/null 2>&1 && return
  curl -fsSL https://opencode.ai/install | bash
}

verify() {
  log "Verify"
  local cmd
  for cmd in git git-lfs curl jq rg node pnpm herdr claude opencode docker; do
    command -v "$cmd" >/dev/null 2>&1 && echo "[OK] $cmd" || echo "[MISSING] $cmd"
  done
  node --version
  pnpm --version
  # Versions only, no login needed
  claude --version
  opencode --version
  ls "$HOME/.cache/ms-playwright" 2>/dev/null | head -3
}

main() {
  [ "$(id -u)" -ne 0 ] || die "Run as factory, not root"
  [ -f "$HOME/.factory-env" ] || die "No ~/.factory-env. Run phase C first."
  # env file may source nvm.sh, which is not safe under set -eu
  set +eu
  # shellcheck source=/dev/null
  . "$HOME/.factory-env"
  set -eu
  setup_git
  clone_repo
  install_node
  install_pnpm
  install_repo_deps
  install_herdr
  install_claude_code
  install_opencode
  verify
  echo "Tools ready. Repo: $REPO_DIR"
}

main "$@"
