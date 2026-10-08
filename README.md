# Articla Webapp — Flatpak Build Guide

This directory contains the complete Flatpak packaging for an Electron-based
desktop client of the Russian-language social forum **https://articla.org**.

The application is built with Electron and packaged for Flathub using
`flatpak-builder`. It wraps the website in a standalone window with a custom
menu, tray icon, always-on-top toggle, and dark-mode styling.

---

## Prerequisites

On your build machine (Linux with Flatpak installed):

```bash
# Install Flatpak and Flathub remote
sudo apt install flatpak flatpak-builder   # Debian/Ubuntu
# or
sudo dnf install flatpak flatpak-builder   # Fedora

flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathubrepo.flatpakrepo

# Install the base runtime and Node.js SDK extension
flatpak install flathub \
  org.freedesktop.Platform \
  org.freedesktop.Sdk \
  org.freedesktop.Platform.Electron2 \
  org.freedesktop.Sdk.Extension.node24
```

---

## Build Locally

```bash
cd /path/to/articla

# Build the Flatpak (this may take several minutes on first run)
flatpak-builder --force-clean --install --user \
  --repo=repo \
  build-dir \
  org.articla.ArticlaWebapp.yml
```

After a successful build, run the app:

```bash
flatpak run org.articla.ArticlaWebapp
```

---

## Testing and Validation

### Inspect the build
```bash
flatpak-builder build-dir org.articla.ArticlaWebapp.yml --show-modules
```

### Run the app in a sandbox (debugging)
```bash
flatpak run --command=bash org.articla.ArticlaWebapp
```

### Check for Flathub-specific lint warnings
```bash
flatpak-builder --keep-build-dirs --install --user \
  --repo=repo \
  --upload https://flathub.org/api/... \
  build-dir \
  org.articla.ArticlaWebapp.yml
```

---

## Publishing to Flathub

1. Fork the [flathub/org.articla.ArticlaWebapp](https://github.com/flathub) repository.
2. Push the manifest and all source files to that repo.
3. Open a PR with the manifest. Flathub CI will build and publish the app.
4. Once approved, users can install it via `flatpak install flathub org.articla.ArticlaWebapp`.

---

## App Details

- **App ID:** `org.articla.ArticlaWebapp`
- **Runtime:** `org.freedesktop.Platform` (25.08)
- **Base:** `org.electronjs.Electron2.BaseApp` (25.08)
- **SDK Extension:** `org.freedesktop.Sdk.Extension.node24`
- **Permissions:**
  - Network access (`--share=network`)
  - Wayland & X11 (`--socket=wayland`, `--socket=fallback-x11`)
  - Audio (`--socket=pulseaudio`)
  - Full device access (`--device=all`)
- **Wrapper:** `zypak-wrapper.sh` for sandboxed GPU/Electron acceleration