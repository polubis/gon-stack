#!/usr/bin/env bash
set -e

echo "Stopping Turbo daemon..."
turbo daemon stop 2>/dev/null || true

echo "Cleaning Turbo daemon state..."
turbo daemon clean 2>/dev/null || true

echo "Removing .turbo directories..."
find . -name ".turbo" -type d -prune | xargs rm -rf
