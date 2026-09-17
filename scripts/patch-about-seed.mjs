import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seedPath = path.join(root, "cms/data/seed.json");
const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
const about = (seed.staticPages || []).find((p) => p.slug === "about");
if (!about) {
  console.error("no about page");
  process.exit(1);
}

const extras = {
  missionEyebrow: "Our Mission",
  heroCtaLabel: "Start a Project",
  missionCtaLabel: "Work With Us",
  breadcrumbLabel: "About",
  ctaEmailLabel: "Email Us",
  ctaHeading: "Ready to Build Something Extraordinary?",
  ctaBody:
    "Let's discuss your project and explore how we can help you achieve your goals.",
  ctaButtonLabel: "Start Your Project",
  ctaEmail: "info@vyntechsolutions.ca",
  missionStats: [
    {
      title: "Web Design & Development",
      label: "50+ custom websites delivered for businesses like yours",
      value: "💻",
    },
    {
      title: "SEO & Digital Marketing",
      label: "300% average traffic growth, real results you can measure",
      value: "📈",
    },
    {
      title: "UI/UX",
      label: "Branding trusted by 40+ businesses",
      value: "🎨",
    },
    {
      title: "AI & ML",
      label: "Automation strategies built to save you hours, every week.",
      value: "🤖",
    },
  ],
};

about.sections = { ...extras, ...(about.sections || {}) };
if (!Array.isArray(about.sections.missionStats) || !about.sections.missionStats.length) {
  about.sections.missionStats = extras.missionStats;
}
for (const [k, v] of Object.entries(extras)) {
  if (k === "missionStats") continue;
  if (about.sections[k] == null || about.sections[k] === "") about.sections[k] = v;
}

fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n");
console.log("about sections ok", Object.keys(about.sections).length, "stats", about.sections.missionStats.length);
