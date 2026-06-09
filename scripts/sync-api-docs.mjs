/**
 * Syncs api/docs/ → src/features/api-docs/docs/
 * Run before every build so the React docs page stays current.
 */
import { cpSync, rmSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src  = join(__dirname, "../../../api/docs");
const dest = join(__dirname, "../src/features/api-docs/docs");

rmSync(dest, { recursive: true, force: true });
cpSync(src, dest, { recursive: true });
console.log("[sync-api-docs] Synced api/docs →", dest);
