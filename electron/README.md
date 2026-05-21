# TSTS Desktop App

Electron wrapper for the TSTS frontend with RustDesk remote support integration.

This package now lives inside the frontend project:

```text
client/tsts/electron
```

The frontend root `package.json` owns the Electron dependencies, scripts, and
Electron Builder config. This folder only contains the desktop source and
desktop build artifacts:

```text
electron/
  main.js
  preload.cjs
  installer.nsh
  icon.ico
  icon.png
  scripts/sync-renderer.mjs
  rustdesk/rustdesk.exe
  dist/      # generated renderer build
  release/   # generated installer output
```

## Setup

Install the desktop dependencies from the frontend root:

```bash
npm run desktop:install
```

The installer bundles `electron/rustdesk/rustdesk.exe` when that file exists locally.

## Development

From `client/tsts`, start the React dev server:

```bash
npm run dev
```

Then start Electron:

```bash
npm run desktop:dev
```

## Build

Build the desktop installer only:

```bash
npm run desktop:release
```

Build the installer and copy it to the backend download folder:

```bash
npm run desktop:release:backend
```

The backend receives:

```text
api/assets/desktop/TSTS-Desktop-Setup.exe
```

## Environment

- `TSTS_API_URL` overrides the Electron API base URL.
- `TSTS_API_HOST` and `TSTS_API_PORT` are used when `TSTS_API_URL` is not set.
- `RUSTDESK_CONFIG` provides the self-hosted RustDesk server config string.

## IPC API

The preload exposes `window.electronAPI` with RustDesk helpers such as:

- `rustdeskConnect(id)`
- `rustdeskConnectViaProtocol(id)`
- `rustdeskGetId()`
- `rustdeskSetId(id)`
- `rustdeskIsInstalled()`
- `rustdeskOpen()`
- `desktopRegisterDevice(payload)`
