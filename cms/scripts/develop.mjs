/**
 * Runs `strapi develop` and keeps schema.json files synced into dist/
 * because Strapi loads content-types from dist/, not src/.
 */
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function copySchemas() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, "copy-schemas.mjs")], {
      cwd: root,
      stdio: "ignore",
    });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error("copy failed"))));
  });
}

await copySchemas();

const strapiBin = path.join(root, "node_modules", "@strapi", "strapi", "bin", "strapi.js");
const child = spawn(process.execPath, [strapiBin, "develop"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

const timer = setInterval(() => {
  copySchemas().catch(() => {});
}, 2500);

const shutdown = () => {
  clearInterval(timer);
  child.kill("SIGINT");
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

child.on("exit", (code) => {
  clearInterval(timer);
  process.exit(code ?? 0);
});
