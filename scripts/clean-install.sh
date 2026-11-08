#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

bash "$DIR/clean-modules.sh"

echo "Removing pnpm-lock.yaml..."
rm -f pnpm-lock.yaml

echo "Installing..."
pnpm install
