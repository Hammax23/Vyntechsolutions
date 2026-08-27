import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "sync-seed.ts");
let t = fs.readFileSync(file, "utf8");

const start = t.indexOf("/** Content keys we intentionally refresh");
const end = t.indexOf("function mergeForced");
if (start < 0 || end < 0) {
  console.error("markers not found", start, end);
  process.exit(1);
}

const replacement = `/** Fill-missing-only. Empty force keys = never overwrite Strapi admin edits on sync. */
const SERVICE_FORCE_KEYS: string[] = [];
const INDUSTRY_FORCE_KEYS: string[] = [];
const HOMEPAGE_FORCE_KEYS: string[] = [];

`;

t = t.slice(0, start) + replacement + t.slice(end);
fs.writeFileSync(file, t);
console.log("Cleared SERVICE/INDUSTRY/HOMEPAGE force keys");
