/**
 * Sets homepage.techStack from TechnologyStack.tsx tabs (tool names only),
 * maps OurServices ribbon art paths onto seed services[].cardImage by slug,
 * and seeds web-development pageSections.engagementStrategies for city pages.
 *
 * Run: node cms/scripts/patch-homepage-techstack.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "..");
const seedPath = path.join(root, "cms", "data", "seed.json");

const techStack = [
  {
    id: "frontend",
    label: "Frontend",
    tools: [
      "React",
      "Next.js",
      "Vue.js",
      "Nuxt",
      "TypeScript",
      "JavaScript",
      "HTML5",
      "CSS3",
      "Tailwind",
      "Bootstrap",
      "Sass",
      "Redux",
      "Vite",
      "Webpack",
      "Zustand",
      "React Query",
    ],
  },
  {
    id: "backend",
    label: "Backend",
    tools: [
      "Node.js",
      "Express",
      "NestJS",
      "Laravel",
      "PHP",
      "Python",
      "Django",
      "FastAPI",
      "GraphQL",
      "Java",
      "Spring",
      "C#",
      "Dotnet",
      "TypeScript",
      "REST",
      "BullMQ",
    ],
  },
  {
    id: "mobile",
    label: "Mobile",
    tools: [
      "React Native",
      "Flutter",
      "Dart",
      "Swift",
      "Kotlin",
      "Firebase",
      "TypeScript",
      "SQLite",
      "Expo",
      "SwiftUI",
      "Jetpack Compose",
      "Realm",
    ],
  },
  {
    id: "database",
    label: "Database",
    tools: [
      "PostgreSQL",
      "MongoDB",
      "MySQL",
      "Redis",
      "Firebase",
      "Prisma",
      "Supabase",
      "Elasticsearch",
      "SQLite",
      "MariaDB",
      "DynamoDB",
      "TypeORM",
      "Mongoose",
    ],
  },
  {
    id: "devops",
    label: "DevOps",
    tools: [
      "AWS",
      "Azure",
      "Google Cloud",
      "Docker",
      "Kubernetes",
      "Terraform",
      "Git",
      "GitHub",
      "GitLab",
      "Nginx",
      "Linux",
      "Grafana",
      "Cloudflare",
      "Vercel",
      "Ansible",
    ],
  },
  {
    id: "seo",
    label: "SEO",
    tools: [
      "Search Console",
      "GA4",
      "Tag Manager",
      "Ahrefs",
      "SEMrush",
      "Screaming Frog",
      "Schema.org",
      "Next.js",
      "Yoast",
      "Rank Math",
      "Hotjar",
      "Looker Studio",
      "PageSpeed",
    ],
  },
  {
    id: "design",
    label: "Design",
    tools: [
      "Figma",
      "Adobe XD",
      "Illustrator",
      "Photoshop",
      "After Effects",
      "Sketch",
      "Framer",
      "Miro",
      "Lottie",
      "Webflow",
      "Canva",
    ],
  },
];

/** OurServices.tsx serviceCards: href slug → art path */
const CARD_IMAGE_BY_SLUG = {
  "ai-ml-solutions": "/services/ribbons/ribbon-1.webp",
  "mobile-app-development": "/services/ribbons/ribbon-2.webp",
  "devops-cicd": "/services/ribbons/ribbon-3.webp",
  "ui-ux-design": "/services/ribbons/ribbon-4.webp",
  "web-development": "/services/ribbons/ribbon-5.webp",
  "custom-software-development": "/services/ribbons/ribbon-6.webp",
  "cloud-solutions": "/services/ribbons/ribbon-7.webp",
  "ecommerce-solutions": "/services/ribbons/ribbon-8.webp",
  "seo-digital-marketing": "/services/ribbons/ribbon-9.webp",
  "maintenance-support": "/services/ribbons/ribbon-10.webp",
};

const DEFAULT_ENGAGEMENT_STRATEGIES = [
  {
    id: "content",
    title: "Engaging Content",
    description:
      "Quality content is the backbone of any successful digital presence. We craft compelling, SEO-optimized copy that resonates with your local audience and drives action.",
    calloutTitle: "Struggling with Bounce Rates?",
    calloutText:
      "Compelling content keeps visitors engaged. Let our team write copy that converts.",
  },
  {
    id: "cta",
    title: "Call-To-Actions",
    description:
      "This feature has the power to compel your customers. Higher interaction and traffic can be achieved with the help of compelling CTAs that create a sense of urgency for the website visitors. For the architecture of a CTA, we follow a proper format. With comprehensive expertise in broader portfolios, our accomplished team will ensure maximum leverage from your portal.",
    calloutTitle: "Struggling with Low Conversions?",
    calloutText:
      "Effective CTAs can change that. Let VynTech Solutions design the perfect CTAs to boost your sales. Contact us now!",
  },
  {
    id: "blog",
    title: "Informative Blog",
    description:
      "An active, informative blog establishes your authority and keeps your website fresh for search engines. We implement scalable blog architectures that attract organic traffic over time.",
    calloutTitle: "Need More Organic Traffic?",
    calloutText:
      "A strategic blog can multiply your inbound leads. Ask us about our content strategy services.",
  },
  {
    id: "mobile",
    title: "Mobile Responsive",
    description:
      "With the majority of local searches happening on mobile devices, a seamless mobile experience is non-negotiable. Our designs are fluid, adapting perfectly to any screen size for maximum engagement.",
    calloutTitle: "Losing Mobile Customers?",
    calloutText:
      "Don't let a poor mobile experience cost you sales. We build mobile-first designs.",
  },
  {
    id: "functionality",
    title: "Proper Functionality",
    description:
      "Broken links, slow load times, and clunky navigation frustrate users. We rigorously test all features to ensure flawless performance that builds trust with your visitors.",
    calloutTitle: "Is Your Site Slow or Buggy?",
    calloutText:
      "Technical issues kill conversions. Let us optimize your site's performance today.",
  },
  {
    id: "media",
    title: "Rich Media",
    description:
      "High-quality images, videos, and interactive elements capture attention faster than text alone. We integrate optimized rich media that enhances your message without slowing down your site.",
    calloutTitle: "Want to Stand Out Visually?",
    calloutText:
      "Engage visitors instantly with custom graphics and optimized video content.",
  },
  {
    id: "social",
    title: "Integrating Social Media",
    description:
      "Connect your website directly to your social channels. We build seamless integrations that encourage sharing, social proof, and community growth right from your landing pages.",
    calloutTitle: "Looking to Grow Your Following?",
    calloutText:
      "Turn website visitors into loyal followers with integrated social strategies.",
  },
  {
    id: "consumer",
    title: "Consumer-Centric Design",
    description:
      "We don't just design for looks; we design for your specific user. By analyzing user behavior, we create intuitive journeys that guide visitors naturally toward becoming customers.",
    calloutTitle: "Are Users Getting Lost?",
    calloutText: "Streamline your user journey with our UX/UI design expertise.",
  },
];

const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));

if (!seed.homepage) seed.homepage = {};
seed.homepage.techStack = techStack;

let cardImagesPatched = 0;
for (const service of seed.services || []) {
  const art = CARD_IMAGE_BY_SLUG[service.slug];
  if (art) {
    service.cardImage = art;
    cardImagesPatched++;
  }
}

const web = (seed.services || []).find((s) => s.slug === "web-development");
if (web) {
  if (!web.pageSections || typeof web.pageSections !== "object") {
    web.pageSections = {};
  }
  if (
    !Array.isArray(web.pageSections.engagementStrategies) ||
    web.pageSections.engagementStrategies.length === 0
  ) {
    web.pageSections.engagementStrategies = DEFAULT_ENGAGEMENT_STRATEGIES;
  }
}

fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n");
console.log(
  `Patched homepage.techStack (${techStack.length} tabs), cardImage on ${cardImagesPatched} services, engagementStrategies on web-development`
);
