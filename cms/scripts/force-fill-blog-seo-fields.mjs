/**
 * Normalize blog post tags to comma-separated text (SEO-friendly Admin field)
 * and ensure content is present. Run from cms/: node ./scripts/force-fill-blog-seo-fields.mjs
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

function tagsToText(raw) {
  if (Array.isArray(raw)) return raw.map(String).map((s) => s.trim()).filter(Boolean).join(", ");
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return "";
    if (t.startsWith("[")) {
      try {
        const parsed = JSON.parse(t);
        if (Array.isArray(parsed)) {
          return parsed.map(String).map((s) => s.trim()).filter(Boolean).join(", ");
        }
      } catch {
        /* keep string */
      }
    }
    return t;
  }
  return "";
}

async function main() {
  const seed = JSON.parse(fs.readFileSync(path.join(root, "data", "seed.json"), "utf8"));
  const { createStrapi } = require("@strapi/strapi");
  console.log("Loading Strapi...");
  const strapi = await createStrapi({ distDir: "./dist" }).load();

  let updated = 0;
  for (const post of seed.blogPosts || []) {
    if (!post.slug) continue;
    const existing = await strapi.documents("api::blog-post.blog-post").findFirst({
      filters: { slug: post.slug },
      populate: ["seo", "category"],
    });
    if (!existing) {
      console.warn("missing post", post.slug);
      continue;
    }

    const data = {
      tags: tagsToText(post.tags ?? existing.tags),
      author: post.author || existing.author || "VynTech Solutions Team",
      readTime: post.readTime || existing.readTime || "5 min",
      content: post.content || existing.content || "",
      excerpt: post.excerpt || existing.excerpt || "",
      metaDescription: post.metaDescription || existing.metaDescription || "",
    };
    if (post.seo && typeof post.seo === "object") {
      data.seo = { ...(existing.seo || {}), ...post.seo };
    }

    await strapi.documents("api::blog-post.blog-post").update({
      documentId: existing.documentId,
      data,
      status: "published",
    });
    console.log("normalized", post.slug, "tags:", data.tags);
    updated++;
  }

  // Also normalize any live posts not in seed
  const live = await strapi.documents("api::blog-post.blog-post").findMany({
    limit: 100,
  });
  for (const row of live || []) {
    const asText = tagsToText(row.tags);
    if (asText && asText !== row.tags) {
      await strapi.documents("api::blog-post.blog-post").update({
        documentId: row.documentId,
        data: { tags: asText },
        status: "published",
      });
      console.log("fixed live tags", row.slug, asText);
      updated++;
    }
  }

  try {
    await strapi.destroy();
  } catch {
    /* ignore */
  }
  console.log("Done. updates:", updated);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
