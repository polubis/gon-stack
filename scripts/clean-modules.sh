#!/usr/bin/env bash
set -e

echo "Stopping Turbo daemon..."
turbo daemon stop 2>/dev/null || true

echo "Removing node_modules..."
find . -name "node_modules" -type d -prune | xargs rm -rf
