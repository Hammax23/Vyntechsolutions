#!/usr/bin/env node
/**
 * Optional manual seed via Strapi REST API.
 * Requires STRAPI_URL + STRAPI_API_TOKEN (Full access) in env.
 * Prefer auto-seed on first `strapi develop` from cms/data/seed.json.
 */
const STRAPI_URL = (process.env.STRAPI_URL || "http://127.0.0.1:1337").replace(/\/$/, "");
const TOKEN = process.env.STRAPI_API_TOKEN;

if (!TOKEN) {
  console.log("Set STRAPI_API_TOKEN to use REST seed.");
  console.log("Otherwise start CMS once: cd cms && npm run develop");
  console.log("Empty collections auto-seed from cms/data/seed.json");
  process.exit(0);
}

console.log(`REST seed against ${STRAPI_URL} — use Admin UI or auto-seed for full populate.`);
console.log("Tip: delete CMS content and restart develop to re-run bootstrap seed.");
