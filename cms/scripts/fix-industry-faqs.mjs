/**
 * Patch industries with FAQ chrome + items (SEO SS).
 * Also align AI/ML overview header with SEO screenshot copy.
 * Run: node cms/scripts/fix-industry-faqs.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "..");
const seedPath = path.join(root, "cms", "data", "seed.json");

const FAQ_CHROME = {
  faqEyebrow: "FAQ",
  faqHeading: "Frequently asked questions",
  faqIntro:
    "Answers about how we work, timelines, and delivery. Still stuck? Chat with the team.",
};

const FAQ_ITEMS = [
  {
    question: "How long does a typical project take?",
    answer:
      "Timelines depend on scope. Most websites launch in 4–8 weeks; larger apps and platforms are planned in clear milestones so you always know what's next.",
  },
  {
    question: "Do you work with businesses across Canada?",
    answer:
      "Yes. We serve clients nationwide from discovery through launch and ongoing support, with remote collaboration and clear communication.",
  },
  {
    question: "What happens after launch?",
    answer:
      "We offer maintenance, monitoring, and iterative improvements so your product stays fast, secure, and aligned with your goals.",
  },
];

const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
let n = 0;
for (const industry of seed.industries || []) {
  Object.assign(industry, FAQ_CHROME, { faqs: FAQ_ITEMS });
  n++;
}

const ai = (seed.services || []).find((s) => s.slug === "ai-ml-solutions");
if (ai) {
  ai.subtitle = "AI Integration and Automation Services";
  ai.overview =
    "We start by understanding what your business actually requires and build AI automation solutions around that goal, not around whatever's trending. Each project has a dedicated team, clear communication, and full ownership of results from the first prototype to production into the systems you already use.";
}

fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n");
console.log(`Patched ${n} industries with FAQ; updated ai-ml-solutions overview header`);
