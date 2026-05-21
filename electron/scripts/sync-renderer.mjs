import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const electronRoot = path.resolve(__dirname, "..");
const source = path.resolve(electronRoot, "..", "dist");
const target = path.resolve(electronRoot, "dist");

if (!fs.existsSync(source)) {
    throw new Error(`Renderer build was not found at ${source}`);
}

fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(source, target, { recursive: true });
console.log(`Copied renderer build to ${target}`);
