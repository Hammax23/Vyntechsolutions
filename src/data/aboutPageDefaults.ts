export type AboutMissionStat = {
  title?: string;
  label?: string;
  value?: string;
};

export type AboutValue = {
  title: string;
  description: string;
};

export type AboutProcessStep = {
  number?: string;
  title: string;
  description: string;
};

export type AboutPageChrome = {
  heroHeading: string;
  heroBody: string;
  bodyHtml: string;
  heroImageUrl: string | null;
  breadcrumbLabel: string;
  missionEyebrow: string;
  missionHeading: string;
  missionBody: string;
  missionBody2: string;
  heroCtaLabel: string;
  missionCtaLabel: string;
  missionStats: AboutMissionStat[];
  valuesEyebrow: string;
  valuesHeading: string;
  values: AboutValue[];
  processEyebrow: string;
  processHeading: string;
  processIntro: string;
  process: AboutProcessStep[];
  ctaHeading: string;
  ctaBody: string;
  ctaButtonLabel: string;
  ctaEmail: string;
  ctaEmailLabel: string;
};

export const aboutPageDefaults: AboutPageChrome = {
  heroHeading: "We Build Software That Drives Growth",
  heroBody:
    "VynTech Solutions is a full-service software development company helping businesses transform ideas into powerful digital products.",
  bodyHtml: "",
  heroImageUrl: null,
  breadcrumbLabel: "About",
  missionEyebrow: "Our Mission",
  missionHeading: "Empowering Businesses Through Innovative Technology",
  missionBody:
    "We believe every business deserves access to world-class software. Our mission is to bridge the gap between visionary ideas and technical execution, delivering solutions that are not just functional, but transformative.",
  missionBody2:
    "Whether you're a startup validating your first MVP or an enterprise modernizing legacy systems, we bring the same level of dedication, expertise, and passion to every project.",
  heroCtaLabel: "Start a Project",
  missionCtaLabel: "Work With Us",
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
  valuesEyebrow: "What Drives Us",
  valuesHeading: "Our Core Values",
  values: [
    {
      title: "Excellence First",
      description:
        "Good enough isn't in our vocabulary. From the first line of code to the final pixel, we sweat the details others skip because your business deserves work we're genuinely proud of.",
    },
    {
      title: "Radical Transparency",
      description:
        "No surprise invoices, no vague timelines, no vanishing acts mid-project. You'll always know exactly where things stand, what's next, and why straight talk, every step of the way.",
    },
    {
      title: "Partnership Mindset",
      description:
        "We're not here to just check boxes and send invoices. When you win, we win. That's why we treat every project like it's our own business on the line.",
    },
    {
      title: "Speed Without Sacrifice",
      description:
        "Fast doesn't have to mean sloppy. We move quickly, stay agile, and still build things that hold up because rushed work today just means rework tomorrow.",
    },
  ],
  processEyebrow: "Our Process",
  processHeading: "How We Bring Ideas to Life",
  processIntro: "A proven methodology refined over 50+ successful projects.",
  process: [
    {
      number: "01",
      title: "Discovery & Strategy",
      description:
        "Before we write a single line of code, we get to know your business inside out your goals, your users, your constraints. We align on the vision first, so nothing gets lost in translation later.",
    },
    {
      number: "02",
      title: "Architecture & Design",
      description:
        "We design systems built to grow with you, not just work for today. Every screen, every interaction, and every technical decision is intentional, laying a foundation that's scalable, intuitive, and built to last.",
    },
    {
      number: "03",
      title: "Agile Development",
      description:
        "You'll never be left wondering what's happening behind the scenes. With two-week sprints and live demos, you see real progress, give real feedback, and stay in the loop from the very first build.",
    },
    {
      number: "04",
      title: "Launch & Scale",
      description:
        "Launch day isn't the finish line it's the starting point. We test rigorously, deploy without disruption, and stick around to optimize, support, and scale your product long after it goes live.",
    },
  ],
  ctaHeading: "Ready to Build Something Extraordinary?",
  ctaBody:
    "Let's discuss your project and explore how we can help you achieve your goals.",
  ctaButtonLabel: "Start Your Project",
  ctaEmail: "info@vyntechsolutions.ca",
  ctaEmailLabel: "Email Us",
};
