#!/usr/bin/env bash
# Wrapper script launched by Flatpak to start the Articla Electron app.
# Uses zypak for sandboxed GPU/Electron acceleration.
set -euo pipefail

zypak-wrapper.sh /app/main/articla-webapp "$@"