#!/usr/bin/env bash
set -e

# Turbo CLI lives in node_modules — clean turbo before removing modules.
bash clean-turbo.sh
bash clean-modules.sh
