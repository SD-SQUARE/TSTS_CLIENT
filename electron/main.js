import { app, BrowserWindow, ipcMain, shell, dialog } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { execFile, exec } from "child_process";
import fs from "fs";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === "development";
const PROTOCOL = "tsts";
const API_BASE_URL =
    process.env.TSTS_API_URL ||
    `http://${process.env.TSTS_API_HOST || "192.168.56.1"}:${process.env.TSTS_API_PORT || "5050"}/api`;
const REGISTRATION_FILE = "desktop-registration.json";

// ─── RustDesk config (your private server) ───────────────────────────────────
// Replace with your actual RustDesk server config string
// Get it from: docker exec rustdesk-hbbs cat /root/id_ed25519.pub
// Then generate config at: https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/install/
const RUSTDESK_CONFIG = process.env.RUSTDESK_CONFIG ||
    "==Qfi0za0Umd3FTZwhVcDtUW0Y0T1NFczYkVmJWTV50ar0UQ3RnW3ZTUHNmZx1mbiojI5V2aiwiI0N3boxWYj9Gbv8iOwRHdoJiOikGchJCLiQ3cvhGbhN2bsJiOikXYsVmciwiI0N3boxWYj9GbiojI0N3boJye";
const RUSTDESK_PASSWORD = process.env.RUSTDESK_PASSWORD || "pass123"; // default password set on requester machines
const RUSTDESK_COMMAND_TIMEOUT_MS = Number(process.env.RUSTDESK_COMMAND_TIMEOUT_MS || 15000);
const RUSTDESK_INSTALL_TIMEOUT_MS = Number(process.env.RUSTDESK_INSTALL_TIMEOUT_MS || 90000);
const RUSTDESK_ID_PATTERN = /^[a-zA-Z0-9_-]{4,64}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rustDeskConfiguredPaths = new Set();

// ─── Single instance lock ─────────────────────────────────────────────────────
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on("second-instance", (event, argv) => {
        if (win) {
            if (win.isMinimized()) win.restore();
            win.focus();
        }
        const url = argv.find(a => a.startsWith(`${PROTOCOL}://`));
        if (url) handleProtocolURL(url);
    });
}

// ─── Protocol registration ────────────────────────────────────────────────────
if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
    }
} else {
    app.setAsDefaultProtocolClient(PROTOCOL);
}

// ─── RustDesk path resolution ─────────────────────────────────────────────────
function getBundledRustDeskPath() {
    return isDev
        ? path.join(__dirname, "rustdesk", "rustdesk.exe")
        : path.join(process.resourcesPath, "rustdesk", "rustdesk.exe");
}

function getLocalAppDataRustDeskPath() {
    const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local");
    return path.join(localAppData, "rustdesk", "rustdesk.exe");
}

function getRustDeskInstalledCandidates() {
    return [
        process.env.RUSTDESK_EXE_PATH,
        "C:\\Program Files\\RustDesk\\rustdesk.exe",
        "C:\\Program Files (x86)\\RustDesk\\rustdesk.exe",
        getLocalAppDataRustDeskPath(),
    ].filter(Boolean);
}

function getInstalledRustDeskPath() {
    return getRustDeskInstalledCandidates().find(candidate => fs.existsSync(candidate));
}

function getRustDeskPath() {
    const bundled = getBundledRustDeskPath();
    return getInstalledRustDeskPath() || (fs.existsSync(bundled) ? bundled : bundled);
}

function normalizeRustDeskId(value) {
    return String(value || "").trim().replace(/\s+/g, "");
}

function isValidRustDeskId(value) {
    return RUSTDESK_ID_PATTERN.test(normalizeRustDeskId(value));
}

function extractRustDeskId(output) {
    const text = String(output || "");
    const lines = String(output || "")
        .split(/\r\n|\n|\r/)
        .map(normalizeRustDeskId)
        .filter(Boolean);

    for (let index = lines.length - 1; index >= 0; index -= 1) {
        const line = lines[index];
        if (RUSTDESK_ID_PATTERN.test(line)) return line;
    }

    const numericCandidates = text.match(/\b\d{6,20}\b/g) || [];
    return numericCandidates[numericCandidates.length - 1] || "";
}

function isValidEmail(value) {
    return EMAIL_PATTERN.test(String(value || "").trim().toLowerCase());
}

function runRustDeskCommand(rustPath, args, timeout = RUSTDESK_COMMAND_TIMEOUT_MS) {
    if (!fs.existsSync(rustPath)) {
        return Promise.resolve({ success: false, error: `RustDesk executable not found at ${rustPath}` });
    }

    return new Promise((resolve) => {
        execFile(rustPath, args, { windowsHide: true, timeout }, (err, stdout, stderr) => {
            if (err) {
                resolve({ success: false, error: stderr?.trim() || err.message });
                return;
            }

            resolve({ success: true, stdout: stdout?.trim() });
        });
    });
}

function runWindowsCommand(command, args, timeout = RUSTDESK_COMMAND_TIMEOUT_MS) {
    return new Promise((resolve) => {
        execFile(command, args, { windowsHide: true, timeout }, (err, stdout, stderr) => {
            if (err) {
                resolve({ success: false, error: stderr?.trim() || err.message });
                return;
            }

            resolve({ success: true, stdout: stdout?.trim() });
        });
    });
}

async function registerRustDeskProtocol(rustPath) {
    if (process.platform !== "win32" || !fs.existsSync(rustPath)) {
        return { success: true };
    }

    const key = "HKCU\\Software\\Classes\\rustdesk";
    const commandValue = `"${rustPath}" "%1"`;
    const writes = [
        ["add", key, "/ve", "/d", "URL:RustDesk Protocol", "/f"],
        ["add", key, "/v", "URL Protocol", "/d", "", "/f"],
        ["add", `${key}\\DefaultIcon`, "/ve", "/d", `${rustPath},0`, "/f"],
        ["add", `${key}\\shell\\open\\command`, "/ve", "/d", commandValue, "/f"],
    ];

    const results = await Promise.all(writes.map((args) => runWindowsCommand("reg.exe", args)));
    const failed = results.find((result) => !result.success);
    return failed || { success: true };
}

async function ensureRustDeskInstalled(options = {}) {
    const installed = getInstalledRustDeskPath();
    if (installed && !options.force) {
        return { success: true, path: installed };
    }

    const bundled = getBundledRustDeskPath();
    if (!fs.existsSync(bundled)) {
        return installed
            ? { success: true, path: installed }
            : { success: false, error: `Bundled RustDesk executable not found at ${bundled}` };
    }

    const result = await runRustDeskCommand(bundled, ["--silent-install"], RUSTDESK_INSTALL_TIMEOUT_MS);
    const installedAfter = getInstalledRustDeskPath();
    if (!result.success && !installedAfter) {
        return { success: false, error: result.error || "RustDesk installation failed" };
    }

    return {
        success: true,
        path: installedAfter || bundled,
        warning: result.success ? undefined : result.error,
    };
}

async function ensureRustDeskConfigured(rustPath = getRustDeskPath(), options = {}) {
    const key = `${rustPath}|${RUSTDESK_CONFIG}|${RUSTDESK_PASSWORD}`;
    if (!options.force && rustDeskConfiguredPaths.has(key)) {
        return { success: true };
    }

    const errors = [];
    if (RUSTDESK_CONFIG) {
        const result = await runRustDeskCommand(rustPath, ["--config", RUSTDESK_CONFIG]);
        if (!result.success) errors.push(result.error);
    }

    if (RUSTDESK_PASSWORD) {
        const result = await runRustDeskCommand(rustPath, ["--password", RUSTDESK_PASSWORD]);
        if (!result.success) errors.push(result.error);
    }

    if (errors.length > 0) {
        return { success: false, error: errors.filter(Boolean).join("; ") };
    }

    rustDeskConfiguredPaths.add(key);
    return { success: true };
}

async function installAndConfigureRustDesk(options = {}) {
    const installResult = await ensureRustDeskInstalled(options);
    if (!installResult.success) return installResult;

    const protocolResult = await registerRustDeskProtocol(installResult.path);
    if (!protocolResult.success) {
        console.warn("RustDesk protocol registration failed:", protocolResult.error);
    }

    const configResult = await ensureRustDeskConfigured(installResult.path, { force: options.force });
    if (!configResult.success) {
        return {
            success: false,
            path: installResult.path,
            error: configResult.error,
            warning: installResult.warning || protocolResult.error,
        };
    }

    return {
        success: true,
        path: installResult.path,
        warning: installResult.warning || protocolResult.error,
    };
}

function escapePowerShellSingleQuoted(value) {
    return String(value || "").replace(/'/g, "''");
}

function parseArgValue(names) {
    for (const arg of process.argv) {
        for (const name of names) {
            if (arg.startsWith(`${name}=`)) return arg.slice(name.length + 1).trim();
        }
    }
    return "";
}

function getRegistrationFilePath() {
    return path.join(app.getPath("userData"), REGISTRATION_FILE);
}

function readPendingRegistrationEmail() {
    const cliEmail = parseArgValue(["--email", "--register-email", "/EMAIL"]);
    if (cliEmail) return cliEmail;

    try {
        const filePath = getRegistrationFilePath();
        if (!fs.existsSync(filePath)) return "";
        const saved = JSON.parse(fs.readFileSync(filePath, "utf8"));
        return typeof saved.email === "string" ? saved.email : "";
    } catch {
        return "";
    }
}

// ─── Window ───────────────────────────────────────────────────────────────────
let win;

function createWindow() {
    win = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 600,
        icon: path.join(__dirname, "icon.png"),
        title: "TSTS Desktop",
        webPreferences: {
            preload: path.join(__dirname, "preload.cjs"),
            contextIsolation: true,
            nodeIntegration: false,
            nativeWindowOpen: true,
        },
    });

    if (isDev) {
        // In dev mode, load the Vite dev server
        win.loadURL("http://localhost:3000");
        win.webContents.openDevTools();
    } else {
        // In production, load the built React app
        const indexPath = path.join(__dirname, "dist", "index.html");
        win.loadFile(indexPath);
    }

    // MSAL popup auth needs a real child window; other links stay external.
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (isMicrosoftAuthUrl(url)) {
            return {
                action: "allow",
                overrideBrowserWindowOptions: {
                    width: 540,
                    height: 720,
                    title: "Microsoft Sign In",
                    webPreferences: {
                        contextIsolation: true,
                        nodeIntegration: false,
                        sandbox: true,
                    },
                },
            };
        }

        shell.openExternal(url);
        return { action: "deny" };
    });
}

function isMicrosoftAuthUrl(url) {
    if (url === "about:blank") return true;
    try {
        const host = new URL(url).hostname.toLowerCase();
        return [
            "login.microsoftonline.com",
            "login.live.com",
            "login.microsoft.com",
        ].some(domain => host === domain || host.endsWith(`.${domain}`));
    } catch {
        return false;
    }
}

async function getLocalRustDeskId() {
    const setupResult = await installAndConfigureRustDesk();
    if (!setupResult.success) {
        return { success: false, error: setupResult.error || "RustDesk is not installed" };
    }

    const rustPath = setupResult.path || getRustDeskPath();
    const result = await runRustDeskCommand(rustPath, ["--get-id"]);
    if (!result.success) return { success: false, error: result.error || "Could not load RustDesk ID" };

    const id = extractRustDeskId(result.stdout);
    if (!id) {
        return { success: false, error: "No valid RustDesk ID was found. Try opening RustDesk once, then refresh the ID." };
    }

    return { success: true, id };
}

async function registerDesktopDevice(email, rustdeskId) {
    const cleanEmail = email?.toString().trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) return { success: false, error: "A valid email is required" };

    const idResult = rustdeskId
        ? { success: true, id: normalizeRustDeskId(rustdeskId) }
        : await getLocalRustDeskId();

    const cleanId = normalizeRustDeskId(idResult.id);
    if (!idResult.success || !isValidRustDeskId(cleanId)) {
        return { success: false, error: idResult.error || "A valid RustDesk ID is required" };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/v1/desktop/register-device`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: cleanEmail, rustdeskId: cleanId }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) {
            return { success: false, error: data.message || data.error || `HTTP ${response.status}` };
        }

        try {
            const filePath = getRegistrationFilePath();
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, JSON.stringify({ email: cleanEmail, rustdeskId: cleanId }, null, 2));
        } catch {
            // Registration succeeded; local persistence is best-effort.
        }

        return { success: true, rustdeskId: cleanId };
    } catch (error) {
        return { success: false, error: error.message || "Registration failed" };
    }
}

async function autoRegisterDesktopDevice() {
    const email = readPendingRegistrationEmail();
    if (!email) return;
    const result = await registerDesktopDevice(email);
    if (!result.success) {
        console.warn("Desktop registration failed:", result.error);
    }
}

// ─── Protocol URL handler ─────────────────────────────────────────────────────
function handleProtocolURL(url) {
    try {
        const parsed = new URL(url);
        const host = parsed.searchParams.get("host");
        if (host) {
            const cleanId = decodeURIComponent(host).replace(/\s+/g, "");
            void launchRustDeskConnect(cleanId);
        }
    } catch (e) {
        console.error("Protocol URL parse error:", e);
    }
}

// ─── RustDesk: connect to remote ─────────────────────────────────────────────
async function launchRustDeskConnect(remoteId) {
    const cleanId = normalizeRustDeskId(remoteId);
    if (!isValidRustDeskId(cleanId)) {
        return { success: false, error: "A valid remote ID is required" };
    }

    const setupResult = await installAndConfigureRustDesk();
    if (!setupResult.success) {
        const rustPath = getRustDeskPath();
        dialog.showErrorBox("RustDesk Not Found", `RustDesk executable not found at:\n${rustPath}\n\nPlease reinstall TSTS Desktop.`);
        return { success: false, error: setupResult.error || "RustDesk not installed" };
    }

    const rustPath = setupResult.path || getRustDeskPath();
    const args = [];
    if (RUSTDESK_CONFIG) args.push("--config", RUSTDESK_CONFIG);
    args.push("--connect", cleanId);
    if (RUSTDESK_PASSWORD) args.push("--password", RUSTDESK_PASSWORD);

    execFile(rustPath, args, { windowsHide: true }, (err) => {
        if (err) console.error("RustDesk connect failed:", err);
    });
    return { success: true, warning: setupResult.warning };
}

// ─── IPC Handlers ─────────────────────────────────────────────────────────────

// Connect to a remote machine by ID
ipcMain.handle("rustdesk:connect", async (event, remoteId) => {
    const cleanId = normalizeRustDeskId(remoteId);
    if (!cleanId) return { success: false, error: "No remote ID provided" };
    return launchRustDeskConnect(cleanId);
});

ipcMain.handle("rustdesk:connect-protocol", async (_event, remoteId) => {
    const cleanId = normalizeRustDeskId(remoteId);
    if (!cleanId) return { success: false, error: "No remote ID provided" };
    return launchRustDeskConnect(cleanId);
});

// Get the local machine's RustDesk ID
ipcMain.handle("rustdesk:get-id", async () => {
    return getLocalRustDeskId();
});

// Set the local machine's RustDesk ID and password (requires elevation)
ipcMain.handle("rustdesk:set-id", async (event, newId) => {
    const cleanId = normalizeRustDeskId(newId).replace(/['"]/g, "");
    if (!isValidRustDeskId(cleanId)) return { success: false, error: "A valid RustDesk ID is required" };
    const password = RUSTDESK_PASSWORD;
    const rustPath = getRustDeskPath();
    const configPath = "C:\\Windows\\ServiceProfiles\\LocalService\\AppData\\Roaming\\RustDesk\\config\\RustDesk.toml";
    const psRustPath = escapePowerShellSingleQuoted(rustPath);
    const psRustDeskConfig = escapePowerShellSingleQuoted(RUSTDESK_CONFIG);
    const psPassword = escapePowerShellSingleQuoted(password);

    const psScript = `
        $path = "${configPath}"
        $rustdesk = '${psRustPath}'
        $serverConfig = '${psRustDeskConfig}'
        $password = '${psPassword}'
        Stop-Service -Name "rustdesk" -Force -ErrorAction SilentlyContinue
        if (Test-Path $path) {
            $content = Get-Content $path | Where-Object {
                $_ -notmatch '^(id|enc_id)\\s*=' -and $_ -notmatch '^password\\s*='
            }
            $newLines = @("id = '${cleanId}'", "password = '$password'")
            $newContent = $newLines + $content
            Set-Content -Path $path -Value $newContent -Encoding UTF8 -Force
        } else {
            New-Item -Path (Split-Path $path) -ItemType Directory -Force -ErrorAction SilentlyContinue
            Set-Content -Path $path -Value @("id = '${cleanId}'", "password = '$password'") -Encoding UTF8 -Force
        }
        Start-Service -Name "rustdesk"
        Start-Sleep -Seconds 2
        if ((Test-Path $rustdesk) -and $serverConfig) {
            & $rustdesk --config $serverConfig | Out-Null
        }
        if ((Test-Path $rustdesk) -and $password) {
            & $rustdesk --password $password | Out-Null
        }
        Restart-Service -Name "rustdesk" -Force -ErrorAction SilentlyContinue
    `;

    const encoded = Buffer.from(psScript, "utf16le").toString("base64");
    const cmd = `powershell -Command "Start-Process powershell -ArgumentList '-NoProfile', '-WindowStyle', 'Hidden', '-EncodedCommand', '${encoded}' -Verb RunAs"`;

    return new Promise((resolve) => {
        exec(cmd, (error) => {
            if (error) {
                resolve({ success: false, error: error.message });
            } else {
                setTimeout(() => resolve({ success: true }), 2000);
            }
        });
    });
});

// Check if RustDesk is installed
ipcMain.handle("rustdesk:is-installed", async () => {
    return { installed: fs.existsSync(getRustDeskPath()) };
});

// Open RustDesk standalone (no connection)
ipcMain.handle("rustdesk:open", async () => {
    const setupResult = await installAndConfigureRustDesk();
    if (!setupResult.success) return { success: false, error: setupResult.error || "Not installed" };
    const rustPath = setupResult.path || getRustDeskPath();
    const openError = await shell.openPath(rustPath);
    if (openError) return { success: false, error: openError };
    return { success: true, warning: setupResult.warning };
});

ipcMain.handle("rustdesk:install-service", async () => {
    return installAndConfigureRustDesk({ force: true });
});

ipcMain.handle("rustdesk:configure-server", async () => {
    return installAndConfigureRustDesk({ force: true });
});

ipcMain.handle("desktop:register-device", async (_event, payload) => {
    return registerDesktopDevice(payload?.email, payload?.rustdeskId);
});

// ─── App lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
    createWindow();
    installAndConfigureRustDesk().catch((error) => {
        console.warn("RustDesk startup setup failed:", error);
    });
    const url = process.argv.find(a => a.startsWith(`${PROTOCOL}://`));
    if (url) handleProtocolURL(url);
    setTimeout(() => {
        autoRegisterDesktopDevice().catch((error) => {
            console.warn("Desktop auto-registration failed:", error);
        });
    }, 2500);
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
