import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seed = JSON.parse(fs.readFileSync(path.join(root, "cms/data/seed.json"), "utf8"));
const obj = {};
for (const ind of seed.industries || []) {
  obj[ind.slug] = ind.faqs || [];
}
const body = JSON.stringify(obj, null, 2);
const out = `/** Unique FAQs per industry — keep in sync with cms/scripts/patch-industry-faqs.mjs and cms/data/seed.json */
export const INDUSTRY_FAQS_BY_SLUG: Record<string, { question: string; answer: string }[]> = ${body};

export function faqsForIndustry(slug: string) {
  return INDUSTRY_FAQS_BY_SLUG[slug] || [];
}
`;
fs.writeFileSync(path.join(root, "src/data/industryFaqs.ts"), out);
console.log("wrote industryFaqs.ts", Object.keys(obj).length);
