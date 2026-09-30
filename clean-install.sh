#!/usr/bin/env bash
set -e

bash clean-modules.sh

echo "Removing pnpm-lock.yaml..."
rm -f pnpm-lock.yaml

echo "Installing..."
pnpm install
