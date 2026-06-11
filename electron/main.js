import { app, BrowserWindow, ipcMain, shell, dialog } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { execFile, exec } from "child_process";
import fs from "fs";
import os from "os";
import http from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === "development";
const PROTOCOL = "tsts";
const DESKTOP_RENDERER_HOST = "localhost";
const DESKTOP_RENDERER_PORT = Number(process.env.TSTS_DESKTOP_PORT || 3000);
const DESKTOP_RENDERER_URL = `http://${DESKTOP_RENDERER_HOST}:${DESKTOP_RENDERER_PORT}`;
const API_BASE_URL =
    process.env.TSTS_API_URL ||
    `http://${process.env.TSTS_API_HOST || "192.168.56.1"}:${process.env.TSTS_API_PORT || "5050"}/api`;
const REGISTRATION_FILE = "desktop-registration.json";

// ─── RustDesk config (private server first, public fallback second) ──────────
const DEFAULT_RUSTDESK_CONFIG =
    "==Qfi0za0Umd3FTZwhVcDtUW0Y0T1NFczYkVmJWTV50ar0UQ3RnW3ZTUHNmZx1mbiojI5V2aiwiI0N3boxWYj9Gbv8iOwRHdoJiOikGchJCLiQ3cvhGbhN2bsJiOikXYsVmciwiI0N3boxWYj9GbiojI0N3boJye";
const RUSTDESK_CONFIG = normalizeRustDeskConfig(
    process.env.RUSTDESK_CONFIG ||
    buildRustDeskConfigFromEnv() ||
    DEFAULT_RUSTDESK_CONFIG,
);
const RUSTDESK_PASSWORD = process.env.RUSTDESK_PASSWORD || "pass123"; // default password set on requester machines
const RUSTDESK_COMMAND_TIMEOUT_MS = Number(process.env.RUSTDESK_COMMAND_TIMEOUT_MS || 15000);
const RUSTDESK_CONNECT_TIMEOUT_MS = Number(process.env.RUSTDESK_CONNECT_TIMEOUT_MS || 12000);
const RUSTDESK_INSTALL_TIMEOUT_MS = Number(process.env.RUSTDESK_INSTALL_TIMEOUT_MS || 90000);
const RUSTDESK_PUBLIC_FALLBACK_ENABLED = false; //process.env.RUSTDESK_PUBLIC_FALLBACK !== "false";
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

function encodeRustDeskConfig(config) {
    return Buffer
        .from(JSON.stringify(config), "utf8")
        .toString("base64")
        .split("")
        .reverse()
        .join("");
}

function decodeRustDeskConfig(config) {
    try {
        const decoded = Buffer
            .from(String(config || "").split("").reverse().join(""), "base64")
            .toString("utf8");
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

function normalizeRustDeskConfig(config) {
    const value = String(config || "").trim();
    if (!value) return "";

    if (value.startsWith("{")) {
        try {
            return encodeRustDeskConfig(JSON.parse(value));
        } catch {
            return value;
        }
    }

    return decodeRustDeskConfig(value) ? value : value;
}

function buildRustDeskConfigFromEnv() {
    const host = process.env.RUSTDESK_SERVER_HOST || process.env.RUSTDESK_HOST;
    const key = process.env.RUSTDESK_SERVER_KEY || process.env.RUSTDESK_KEY;
    if (!host && !key) return "";

    return encodeRustDeskConfig({
        host: host || "",
        relay: process.env.RUSTDESK_RELAY_HOST || process.env.RUSTDESK_RELAY || host || "",
        api: process.env.RUSTDESK_API_URL || process.env.RUSTDESK_API || "",
        key: key || "",
    });
}

function describeRustDeskConfig(config) {
    const decoded = decodeRustDeskConfig(config);
    if (!decoded) return { configured: Boolean(config) };

    return {
        configured: true,
        host: decoded.host || "",
        relay: decoded.relay || "",
        api: decoded.api || "",
        hasKey: Boolean(decoded.key),
    };
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

function launchRustDeskProcess(rustPath, args) {
    return new Promise((resolve) => {
        let settled = false;
        const finish = (result) => {
            if (settled) return;
            settled = true;
            resolve(result);
        };

        const child = execFile(rustPath, args, { windowsHide: false }, (err, stdout, stderr) => {
            if (err) {
                finish({ success: false, error: stderr?.trim() || err.message });
                return;
            }
            finish({ success: true, stdout: stdout?.trim() });
        });

        child.once("spawn", () => {
            setTimeout(() => finish({ success: true }), RUSTDESK_CONNECT_TIMEOUT_MS);
        });
        child.once("error", (error) => {
            finish({ success: false, error: error.message });
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

    if (process.platform === "win32") {
        const serviceResult = await runRustDeskCommand(rustPath, ["--install-service"], RUSTDESK_INSTALL_TIMEOUT_MS);
        if (!serviceResult.success) {
            console.warn("RustDesk service install skipped:", serviceResult.error);
        }
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
        if (!options.requirePrivate && RUSTDESK_PUBLIC_FALLBACK_ENABLED) {
            return {
                success: true,
                path: installResult.path,
                mode: "public-fallback",
                warning: configResult.error || installResult.warning || protocolResult.error,
            };
        }

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
        mode: RUSTDESK_CONFIG ? "self-hosted" : "public",
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
let productionRendererServer;

function getRendererDistPath() {
    return path.join(__dirname, "dist");
}

function getStaticContentType(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    return {
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".mjs": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".svg": "image/svg+xml",
        ".ico": "image/x-icon",
        ".woff": "font/woff",
        ".woff2": "font/woff2",
        ".ttf": "font/ttf",
        ".mp4": "video/mp4",
    }[extension] || "application/octet-stream";
}

function resolveRendererAsset(requestUrl) {
    const distPath = getRendererDistPath();
    const parsedUrl = new URL(requestUrl, DESKTOP_RENDERER_URL);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    if (pathname === "/" || pathname === "") {
        pathname = "/index.html";
    }

    const requestedPath = path.normalize(path.join(distPath, pathname));
    const relativePath = path.relative(distPath, requestedPath);
    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        return path.join(distPath, "index.html");
    }

    if (fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()) {
        return requestedPath;
    }

    return path.join(distPath, "index.html");
}

function startProductionRendererServer() {
    if (isDev) return Promise.resolve(DESKTOP_RENDERER_URL);
    if (productionRendererServer?.listening) return Promise.resolve(DESKTOP_RENDERER_URL);

    return new Promise((resolve, reject) => {
        const distPath = getRendererDistPath();
        if (!fs.existsSync(path.join(distPath, "index.html"))) {
            reject(new Error(`Renderer build not found at ${distPath}. Run npm run desktop:build:renderer first.`));
            return;
        }

        productionRendererServer = http.createServer((req, res) => {
            try {
                const filePath = resolveRendererAsset(req.url || "/");
                res.writeHead(200, {
                    "Content-Type": getStaticContentType(filePath),
                    "Cache-Control": path.basename(filePath) === "index.html" || path.basename(filePath) === "redirect.html"
                        ? "no-store"
                        : "public, max-age=31536000, immutable",
                });
                fs.createReadStream(filePath).pipe(res);
            } catch (error) {
                res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
                res.end(error.message || "Unable to load desktop renderer");
            }
        });

        productionRendererServer.once("error", (error) => {
            reject(error);
        });
        productionRendererServer.listen(DESKTOP_RENDERER_PORT, DESKTOP_RENDERER_HOST, () => {
            resolve(DESKTOP_RENDERER_URL);
        });
    });
}

async function createWindow() {
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
        win.loadURL(DESKTOP_RENDERER_URL);
        win.webContents.openDevTools();
    } else {
        // In production, keep the app on localhost so MSAL popup redirects
        // match the Azure SPA redirect URI and avoid file:// origin issues.
        const rendererUrl = await startProductionRendererServer();
        win.loadURL(rendererUrl);
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
    const privateArgs = [];
    if (RUSTDESK_CONFIG) privateArgs.push("--config", RUSTDESK_CONFIG);
    privateArgs.push("--connect", cleanId);
    if (RUSTDESK_PASSWORD) privateArgs.push("--password", RUSTDESK_PASSWORD);

    if (RUSTDESK_CONFIG) {
        const privateResult = await launchRustDeskProcess(rustPath, privateArgs);
        if (privateResult.success) {
            return { success: true, mode: "self-hosted", warning: setupResult.warning };
        }

        if (!RUSTDESK_PUBLIC_FALLBACK_ENABLED) {
            return { success: false, mode: "self-hosted", error: privateResult.error || "RustDesk private server launch failed" };
        }

        console.warn("RustDesk self-hosted launch failed; falling back to public server:", privateResult.error);
    }

    const publicArgs = ["--connect", cleanId];
    if (RUSTDESK_PASSWORD) publicArgs.push("--password", RUSTDESK_PASSWORD);
    const publicResult = await launchRustDeskProcess(rustPath, publicArgs);
    if (!publicResult.success) {
        return { success: false, mode: "public", error: publicResult.error || "RustDesk public fallback launch failed" };
    }

    return {
        success: true,
        mode: "public-fallback",
        warning: setupResult.warning || "Connected with RustDesk public fallback.",
    };
}

// ─── IPC Handlers ─────────────────────────────────────────────────────────────

// Connect to a remote machine by ID
ipcMain.handle("rustdesk:connect", async (event, remoteId) => {
    await installAndConfigureRustDesk();
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

ipcMain.handle("rustdesk:server-status", async () => {
    return {
        privateConfigured: Boolean(RUSTDESK_CONFIG),
        config: describeRustDeskConfig(RUSTDESK_CONFIG),
        publicFallbackEnabled: RUSTDESK_PUBLIC_FALLBACK_ENABLED,
    };
});

// Open RustDesk standalone (no connection)
ipcMain.handle("rustdesk:open", async () => {
    const setupResult = await installAndConfigureRustDesk();
    if (!setupResult.success) return { success: false, error: setupResult.error || "Not installed" };
    const rustPath = setupResult.path || getRustDeskPath();
    const privateArgs = [];
    if (RUSTDESK_CONFIG) privateArgs.push("--config", RUSTDESK_CONFIG);
    // if (RUSTDESK_PASSWORD) privateArgs.push("--password", RUSTDESK_PASSWORD);

    if (privateArgs.length > 0) {
        const privateResult = await launchRustDeskProcess(rustPath, privateArgs);
        if (privateResult.success) {
            return { success: true, mode: "self-hosted", warning: setupResult.warning };
        }

        if (!RUSTDESK_PUBLIC_FALLBACK_ENABLED) {
            return { success: false, mode: "self-hosted", error: privateResult.error || "RustDesk private server launch failed" };
        }
    }

    const openError = await shell.openPath(rustPath);
    if (openError) return { success: false, mode: "public", error: openError };
    return { success: true, mode: "public-fallback", warning: setupResult.warning };
});

ipcMain.handle("rustdesk:install-service", async () => {
    return installAndConfigureRustDesk({ force: true });
});

ipcMain.handle("rustdesk:configure-server", async () => {
    return installAndConfigureRustDesk({ force: true, requirePrivate: true });
});

ipcMain.handle("desktop:register-device", async (_event, payload) => {
    return registerDesktopDevice(payload?.email, payload?.rustdeskId);
});

// ─── App lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
    try {
        await createWindow();
    } catch (error) {
        dialog.showErrorBox(
            "TSTS Desktop failed to start",
            `${error.message || error}\n\nMake sure port ${DESKTOP_RENDERER_PORT} is free; it is required for Microsoft SSO.`,
        );
        app.quit();
        return;
    }
    // installAndConfigureRustDesk().catch((error) => {
    //     console.warn("RustDesk startup setup failed:", error);
    // });
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

app.on("before-quit", () => {
    productionRendererServer?.close?.();
});

app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) await createWindow();
});
