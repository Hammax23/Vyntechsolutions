/**
 * Force blog static-page chrome (sections) from seed into Strapi.
 * Run from cms/: node ./scripts/force-fill-blog-static.mjs
 */
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
process.chdir(root);

const envPath = path.join(root, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}
process.env.CMS_SYNC_SEED = "false";
process.env.CMS_AUTO_SEED = "false";

async function main() {
  const seed = JSON.parse(fs.readFileSync(path.join(root, "data", "seed.json"), "utf8"));
  const blogStatic = (seed.staticPages || []).find((p) => p.slug === "blog");
  if (!blogStatic) {
    console.error("No blog static page in seed");
    process.exit(1);
  }

  const { createStrapi } = require("@strapi/strapi");
  console.log("Loading Strapi...");
  const strapi = await createStrapi({ distDir: "./dist" }).load();

  const existing = await strapi.documents("api::static-page.static-page").findFirst({
    filters: { slug: "blog" },
  });

  const data = {
    title: blogStatic.title || "Blog",
    slug: "blog",
    heroHeading: blogStatic.heroHeading || "Blog",
    heroBody: blogStatic.heroBody || "",
    sections: blogStatic.sections || {},
  };

  if (existing) {
    await strapi.documents("api::static-page.static-page").update({
      documentId: existing.documentId,
      data,
      status: "published",
    });
    console.log("updated static-page blog sections:", Object.keys(data.sections).join(", "));
  } else {
    await strapi.documents("api::static-page.static-page").create({
      data,
      status: "published",
    });
    console.log("created static-page blog");
  }

  try {
    await strapi.destroy();
  } catch {
    /* ignore pool timeout on shutdown */
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
