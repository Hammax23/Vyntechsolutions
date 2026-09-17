/**
 * Patch seed.json with customSoftwareServicesBlock + coreCapabilitiesBlock.
 * Run: node cms/scripts/patch-custom-software-blocks.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..", "..");
const seedPath = path.join(root, "cms", "data", "seed.json");

const BLOCKS = {
  "mobile-app-development": {
    coreCapabilitiesBlock: {
      eyebrow: "Our Core Capabilities",
      items: [
        {
          title: "Cloud Native",
          icon: "multicloud",
          description:
            "Cloud-native applications engineered to scale dynamically with demand.",
        },
        {
          title: "Mobile Builds",
          icon: "mobile",
          description:
            "iOS and Android builds with smooth cross-platform execution.",
        },
        {
          title: "UI & UX Experience",
          icon: "prototype",
          description:
            "Interfaces built for rapid adoption and long-term user engagement.",
        },
        {
          title: "API Integrations",
          icon: "security",
          description: "Secure API links into ERP, CRM, and existing tools.",
        },
        {
          title: "Data Compliance",
          icon: "security",
          description:
            "Compliance with Canadian data laws like PIPEDA, CPPA, Quebec Law 25, PHIPA for healthcare.",
        },
      ],
    },
  },
  "custom-software-development": {
    customSoftwareServicesBlock: {
      heading: "Software Services",
      headingAccent: "we provide",
      description:
        "A business needs strategy as well as a tech team to know the market trends. If you have decided to start a software business, VynTech Solutions can become your roadmap to the destination. Here are the software development services that we provide.",
      items: [
        {
          title: "Custom Software Development",
          icon: "code",
          description:
            "It is a good catch to have own software to keep your audience on a single platform. So, it will be easy to target them through new services, updates and customized solutions. We offer custom and innovative software development services, from ideation to deployment tailored to objectives helping businesses grow.",
        },
        {
          title: "Custom Crm Development Services",
          icon: "code",
          description:
            "At VynTech Solutions, you won't get the pre-designed softwares for your new and unique business. Our in-house team of software development experts build custom solutions to meet the specific needs and requirements of a business. Unique ideas deserve unique solutions.",
        },
        {
          title: "Enterprise Software Development Company",
          icon: "enterprise",
          description:
            "We have latest enterprise solutions to give robust and scalable solutions. Technology has ruled the market for years so it is an impressive decision to have software for your business. We specialize in offering full-service software development, to design, build, and deploy that function seamlessly without any problem.",
        },
        {
          title: "Software Consulting Services",
          icon: "strategy",
          description:
            "We leverage the power of software development to give smooth and secure experience that deliver captivating user experiences across platforms. Even after launching your product, we won't leave you. In fact, you will get regular updates from our company regarding updates.",
        },
        {
          title: "Software Integration Services",
          icon: "integration",
          description:
            "With Software integration services, we give extraordinary experience by connecting your systems and apps using latest technology. These softwares can help you to reach your audience easily without focussing on the device type as we develop software for every business.",
        },
        {
          title: "API Development Services",
          icon: "api",
          description:
            "With our powerful API development services, we grow your online ecosystem using powerful and flexible features to develop result-oriented solutions for your specific business requirements. We have a track record of doing business honestly so you can trust us for your dream project. Your dream is our responsibility.",
        },
      ],
    },
    coreCapabilitiesBlock: {
      eyebrow: "Our Core Capabilities",
      items: [
        {
          title: "Enterprise Architecture",
          icon: "enterprise",
          description:
            "Scalable systems engineered to support complex operations and growth.",
        },
        {
          title: "Legacy Modernization",
          icon: "migrate",
          description:
            "Upgrading outdated platforms to modern technology stacks securely.",
        },
        {
          title: "Workflow Automation",
          icon: "speed",
          description: "Replacing manual tasks with automated business workflows.",
        },
        {
          title: "Custom Integrations",
          icon: "integration",
          description: "Connecting ERPs, CRMs, and third-party APIs seamlessly.",
        },
        {
          title: "Enterprise Security",
          icon: "security",
          description:
            "Robust data protection adhering to ISO standards and PIPEDA.",
        },
      ],
    },
  },
};

const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
let patched = 0;

for (const svc of seed.services || []) {
  const blocks = BLOCKS[svc.slug];
  if (!blocks) continue;
  for (const [key, value] of Object.entries(blocks)) {
    svc[key] = value;
    patched++;
  }
  svc.pageSections = {
    ...(svc.pageSections || {}),
    ...(blocks.customSoftwareServicesBlock
      ? { customSoftwareServices: blocks.customSoftwareServicesBlock }
      : {}),
    ...(blocks.coreCapabilitiesBlock
      ? { coreCapabilities: blocks.coreCapabilitiesBlock }
      : {}),
  };
}

fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n");
console.log("Patched custom software / core capabilities blocks:", patched, "assignments");
