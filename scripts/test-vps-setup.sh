#!/usr/bin/env bash
#
# Smoke test for vps-setup.sh inside a throwaway ubuntu container.
# Covers: packages, factory user, secrets file, nvm/Node/pnpm, agents, clone, deps, re-run.
# GH_TOKEN is a fake value: the fork step is expected to fail with a warning, not abort.
# Not covered (needs systemd / real host): rootless Docker, ufw, SSH hardening, Supabase.
#
# Usage:
#   bash scripts/test-vps-setup.sh
#
# Optional env:
#   IMAGE=ubuntu:24.04
#   REPO_URL=https://github.com/polubis/gon-stack.git   (must be public)
#   INSTALL_DEPS=0                                      (faster, skips pnpm install)
#
set -Eeuo pipefail

IMAGE="${IMAGE:-ubuntu:24.04}"
REPO_URL="${REPO_URL:-https://github.com/polubis/gon-stack.git}"
INSTALL_DEPS="${INSTALL_DEPS:-1}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Git Bash on Windows needs a native path for docker -v.
HOST_DIR="$(cd "$SCRIPT_DIR" && (pwd -W 2>/dev/null || pwd))"

command -v docker >/dev/null || { echo "docker is required" >&2; exit 1; }
docker info >/dev/null 2>&1 || { echo "docker daemon is not running" >&2; exit 1; }

MSYS_NO_PATHCONV=1 docker run --rm \
  -e REPO_URL="$REPO_URL" \
  -e INSTALL_DEPS="$INSTALL_DEPS" \
  -e GH_TOKEN="ghp_faketoken_for_test_only" \
  -v "$HOST_DIR/vps-setup.sh:/vps-setup.sh:ro" \
  "$IMAGE" bash -c '
    set -Eeuo pipefail
    export DEBIAN_FRONTEND=noninteractive
    export HARDEN=0 SKIP_DOCKER=1 INSTALL_PLAYWRIGHT=0

    # sudo present so the "factory has no sudo" assertion can fail for real.
    apt-get update -qq && apt-get install -y -qq sudo >/dev/null

    echo "##### run 1"
    bash /vps-setup.sh

    echo "##### run 2 (idempotency)"
    bash /vps-setup.sh

    echo "##### assertions"
    fail=0
    check() {
      if runuser -l factory -c "$2" >/dev/null 2>&1; then
        echo "[PASS] $1"
      else
        echo "[FAIL] $1"
        fail=1
      fi
    }

    check "factory has no sudo"        "command -v sudo && ! sudo -n true"
    check "factory not in docker group" "! id -nG | grep -qw docker"
    check "no ssh key by default"      "! test -e ~/.ssh/id_ed25519"
    check "secrets file is 0600"       "test \"\$(stat -c %a ~/config/secrets.env)\" = 600"
    check "GH_TOKEN visible in shell"  "bash -c \"test -n \\\"\\\$GH_TOKEN\\\"\""
    check "token never inside repo"    "! grep -rqs ghp_faketoken ~/workspaces/gon-stack --exclude-dir=node_modules"
    check "git identity set"           "git config --global user.name"
    check "node on PATH"               "node --version"
    check "pnpm on PATH"               "pnpm --version"
    check "node matches .nvmrc"        "test \"\$(node --version)\" = \"v\$(tr -d \"[:space:]v\" < ~/workspaces/gon-stack/.nvmrc)\""
    check "pnpm matches packageManager" "test \"\$(pnpm --version)\" = \"\$(node -p \"require(\\\"./workspaces/gon-stack/package.json\\\").packageManager.slice(5).split(\\\"+\\\")[0]\")\""
    check "claude on PATH"             "claude --version"
    check "opencode on PATH"           "opencode --version"
    check "herdr on PATH"              "herdr --version"
    check "repo cloned"                "test -d ~/workspaces/gon-stack/.git"
    if [ "$INSTALL_DEPS" = "1" ]; then
      check "deps installed"           "test -d ~/workspaces/gon-stack/node_modules"
    fi
    check "non-login shell sees node"  "bash -c \"node --version\""

    exit $fail
  '
