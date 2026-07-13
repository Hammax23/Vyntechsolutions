import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function copySchemasOnly(srcApi, destApi) {
  fs.mkdirSync(destApi, { recursive: true });
  for (const apiName of fs.readdirSync(srcApi)) {
    const ctSrc = path.join(srcApi, apiName, "content-types");
    if (!fs.existsSync(ctSrc)) continue;
    const ctDest = path.join(destApi, apiName, "content-types");
    copyDir(ctSrc, ctDest);
  }
}

copySchemasOnly(path.join(root, "src", "api"), path.join(root, "dist", "src", "api"));
copyDir(path.join(root, "src", "components"), path.join(root, "dist", "src", "components"));
console.log("Copied content-type schemas and components into dist/");
