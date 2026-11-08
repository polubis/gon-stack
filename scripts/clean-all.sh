#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Turbo CLI lives in node_modules — clean turbo before removing modules.
bash "$DIR/clean-turbo.sh"
bash "$DIR/clean-modules.sh"
