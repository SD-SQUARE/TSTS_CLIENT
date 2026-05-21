import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, "..");
const installerName = "TSTS-Desktop-Setup.exe";

const releaseDir = path.join(frontendRoot, "electron", "release");
const backendDesktopDir = path.resolve(frontendRoot, "..", "..", "api", "assets", "desktop");
const installerSource = path.join(releaseDir, installerName);
const installerTarget = path.join(backendDesktopDir, installerName);

if (!fs.existsSync(installerSource)) {
  throw new Error(`Desktop installer was not found at ${installerSource}. Run npm run desktop:release first.`);
}

fs.mkdirSync(backendDesktopDir, { recursive: true });
fs.copyFileSync(installerSource, installerTarget);

const sizeMb = (fs.statSync(installerTarget).size / 1024 / 1024).toFixed(1);
console.log(`Copied ${installerName} (${sizeMb} MB) to ${backendDesktopDir}`);
