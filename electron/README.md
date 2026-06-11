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

- `TSTS_DESKTOP_PORT` overrides the localhost renderer port. Keep this at `3000`
  unless the Azure SPA redirect URI is changed too.
- `TSTS_API_URL` overrides the Electron API base URL.
- `TSTS_API_HOST` and `TSTS_API_PORT` are used when `TSTS_API_URL` is not set.
- `RUSTDESK_CONFIG` provides the self-hosted RustDesk server config string.
- `RUSTDESK_PASSWORD` overrides the default unattended access password used for requester machines.
- `RUSTDESK_EXE_PATH` overrides RustDesk executable discovery.

In production the desktop app serves the built renderer from
`http://localhost:3000` instead of `file://` so Microsoft SSO can complete on
the registered SPA redirect URI `http://localhost:3000/redirect.html`.

The NSIS installer validates the requester email, writes it to the desktop registration file, installs/copies the bundled RustDesk executable, registers both `tsts://` and `rustdesk://`, and applies the self-hosted RustDesk config. The Electron app also self-heals this setup before reading the local ID, opening RustDesk, changing the ID, or starting a connection.

Silent installer overrides are supported:

```powershell
TSTS-Desktop-Setup.exe /S /EMAIL=user@example.com /RUSTDESK_CONFIG=<config-string> /RUSTDESK_PASSWORD=<password>
```

`/EMAIL=` is required for silent installs so the first app launch can register the machine with the API.

## IPC API

The preload exposes `window.electronAPI` with RustDesk helpers such as:

- `rustdeskConnect(id)`
- `rustdeskConnectViaProtocol(id)`
- `rustdeskGetId()`
- `rustdeskSetId(id)`
- `rustdeskIsInstalled()`
- `rustdeskOpen()`
- `rustdeskInstallService()`
- `rustdeskConfigureServer()`
- `desktopRegisterDevice(payload)`
