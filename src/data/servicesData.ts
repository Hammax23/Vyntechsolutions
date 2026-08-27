import {
  defaultServiceChrome,
  defaultTechStack,
  servicePageSectionsBySlug,
  type ServicePageSections,
} from "@/data/servicePageSections";

export type ServiceData = {
  title: string;
  subtitle: string;
  description: string;
  icon?: string;
  cardImage?: string;
  heroImage: string;
  heroVariant?: string;
  heroCtaLabel?: string;
  overview: string;
  overviewTagline?: string;
  featuresEyebrow?: string;
  features: { title: string; description: string; icon: string }[];
  technologies: string[];
  process: { step: string; description: string }[];
  stats: { value: string; label: string }[];
  caseStudies: { title: string; industry: string; result: string }[];
  // Why Choose Us
  whyChooseUsHeading?: string;
  whyChooseUsIntro?: string;
  whyChooseUsSubHeading?: string;
  whyChooseUsSubText?: string;
  whyChooseUsCards?: { icon: string; label: string }[];
  // How We Deliver
  deliveryEyebrow?: string;
  deliveryHeading?: string;
  deliveryDescription?: string;
  deliverySteps?: { title: string; content: string }[];
  processHeading?: string;
  processDescription?: string;
  faqs?: { question: string; answer: string }[];
  ctaHeading?: string;
  ctaBody?: string;
  ctaButtonLabel?: string;
  showTechStack?: boolean;
  techStack?: ServicePageSections["techStack"];
  pageSections?: ServicePageSections;
  canadaCities?: ServicePageSections["canadaCities"] | string[];
};

export type ServicesListingDefaults = {
  heroEyebrow: string;
  heroHeading: string;
  heroBody: string;
  learnMoreLabel: string;
  whyChooseEyebrow: string;
  whyChooseHeading: string;
  whyChooseBody: string;
  whyChooseItems: { title: string; description: string }[];
  stats: { value: string; label: string }[];
  secondaryCtaLabel: string;
  ctaHeading: string;
  ctaBody: string;
  ctaLabel: string;
  ctaHref: string;
};

export const servicesListingDefaults: ServicesListingDefaults = {
  heroEyebrow: "Our Expertise",
  heroHeading: "What We Do",
  heroBody:
    "Comprehensive technology services designed to transform your business. From strategy to execution, we deliver solutions that drive growth.",
  learnMoreLabel: "Learn More",
  whyChooseEyebrow: "Why Choose Us",
  whyChooseHeading: "Your Success Is Our Priority",
  whyChooseBody:
    "We don't just build technology, we build partnerships. Our team of experts works closely with you to understand your challenges and deliver solutions that exceed expectations.",
  whyChooseItems: [
    {
      title: "Expert Team",
      description: "A focused team across web, mobile, and cloud",
    },
    {
      title: "Proven Track Record",
      description: "50+ successful projects delivered",
    },
    {
      title: "Agile Approach",
      description: "Flexible methodologies adapted to your needs",
    },
    {
      title: "24/7 Support",
      description: "Round-the-clock assistance for your peace of mind",
    },
  ],
  stats: [
    { value: "12+", label: "Years Experience" },
    { value: "50+", label: "Projects Delivered" },
    { value: "4+", label: "Countries Served" },
    { value: "40+", label: "Happy Clients" },
  ],
  secondaryCtaLabel: "Get in Touch",
  ctaHeading: "Ready to Transform Your Business?",
  ctaBody:
    "Let's discuss how our services can help you achieve your goals and drive real results.",
  ctaLabel: "Get in Touch",
  ctaHref: "/lets-talk-business",
};

const SERVICE_ICON_BY_SLUG: Record<string, string> = {
  "web-development": "code",
  "mobile-app-development": "mobile",
  "cloud-solutions": "cloud",
  "ai-ml-solutions": "ai",
  "devops-cicd": "devops",
  "ui-ux-design": "design",
  "ecommerce-solutions": "ecommerce",
  "custom-software-development": "custom",
  "seo-digital-marketing": "marketing",
  "maintenance-support": "support",
  "tax-accounting": "tax",
};

const HERO_VARIANT_BY_SLUG: Record<string, string> = {
  "web-development": "browser",
  "mobile-app-development": "mobile",
  "cloud-solutions": "cloud",
  "devops-cicd": "devops",
  "ai-ml-solutions": "aiml",
  "ui-ux-design": "uiux",
  "ecommerce-solutions": "ecommerce",
  "custom-software-development": "custom",
  "seo-digital-marketing": "seo",
  "maintenance-support": "maintenance",
  "tax-accounting": "tax",
};

const DEFAULT_OVERVIEW_TAGLINE =
  "We focus on understanding your business goals first, then build solutions that actually solve problems, not just look good on paper. Every project gets dedicated attention, clear communication, and a team that takes ownership of delivering results on time.";

const DEFAULT_WHY_CHOOSE = {
  whyChooseUsHeading: "Why choose us",
  whyChooseUsIntro:
    "As you know, digital solutions are the core concept of online businesses today. Either driving qualified traffic or building scalable software, digital strategy is essential for your enterprise to grow revenue and stay competitive. VynTech Solutions is a premier web design and software development agency delivering reliable, high-performance services.",
  whyChooseUsSubHeading: "Imaginations into creativity",
  whyChooseUsSubText:
    "As a dedicated software and web development company, we have worked on websites and web applications with incredible clients for diverse industries. It has enabled us to stretch our imaginations into a new realm of creativity and apply technical skills to enhance user experience.",
  whyChooseUsCards: [
    { icon: "chart", label: "Result Driven\nApproach" },
    { icon: "desktop", label: "Digital First\nStrategies" },
    { icon: "users", label: "Team of Experienced\nProfessionals" },
    { icon: "clock", label: "On Time Delivery" },
    { icon: "check", label: "No False\nCommitments" },
    { icon: "star", label: "Industry Standard\nQuality" },
  ],
};

const DEFAULT_SERVICE_FAQS = [
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

const TAX_WHY_CHOOSE = {
  whyChooseUsHeading: "Why choose us",
  whyChooseUsIntro:
    "Managing taxes and accounting isn't just about numbers, it's about making confident financial decisions. At VynTech Solutions, our certified accounting professionals provide accurate, transparent, and deadline-driven financial services tailored for Canadian businesses of every size.",
  whyChooseUsSubHeading: "Precision you can trust",
  whyChooseUsSubText:
    "From personal income tax to corporate filings and CRA compliance, we handle the complexity so you can focus on growing your business. Every engagement is backed by transparency, accuracy, and proactive year-round support.",
  whyChooseUsCards: [
    { icon: "shield", label: "CRA Compliant\nFilings" },
    { icon: "users", label: "Certified\nAccountants" },
    { icon: "clock", label: "On-Time\nDeadlines" },
    { icon: "trend", label: "Maximum Tax\nSavings" },
    { icon: "chart", label: "Transparent\nPricing" },
    { icon: "check", label: "Year-Round\nSupport" },
  ],
};

const baseServicesData: Record<string, ServiceData> = {
  "web-development": {
    "title": "Web Development",
    "subtitle": "Website Design and Development Services Built to Perform",
    "description": "As a trusted web development company, VynTech Solutions designs and engineers websites and applications that don't just look good they drive real business results. From first click to final conversion, we build digital experiences your customers trust and your business can scale on.",
    "heroImage": "/services/web-dev.jpg",
    "overview": "We build websites and web apps using modern frameworks like React, Next.js, and Node.js. Whether you need a company website, a customer portal, an admin dashboard, or a full SaaS product, we write clean, maintainable code that works reliably. No bloated templates, no unnecessary complexity.",
    "features": [
      {
        "title": "Business Websites",
        "description": "Corporate sites, landing pages, and marketing websites. Mobile-responsive, fast-loading, SEO-friendly.",
        "icon": "code"
      },
      {
        "title": "Web Applications",
        "description": "Dashboards, portals, booking systems, internal tools, any web-based software your business needs.",
        "icon": "mobile"
      },
      {
        "title": "API Development",
        "description": "RESTful APIs and GraphQL services to connect your frontend, mobile apps, and third-party systems.",
        "icon": "api"
      },
      {
        "title": "Database Design",
        "description": "PostgreSQL, MongoDB, MySQL, proper schema design, indexing, and query optimization.",
        "icon": "speed"
      }
    ],
    "technologies": [
      "React",
      "Next.js",
      "Node.js",
      "TypeScript",
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "AWS"
    ],
    "process": [
      {
        "step": "Discovery & Planning",
        "description": "We map your goals, audience, and pages, then lock scope, timeline, and success metrics before design starts."
      },
      {
        "step": "UX & Visual Design",
        "description": "Wireframes and polished UI so the site looks right and converts, reviewed with you before we write code."
      },
      {
        "step": "Development",
        "description": "We build in React and Next.js with clean, SEO-ready structure. You see progress in weekly demos, not months later."
      },
      {
        "step": "QA & Performance",
        "description": "Cross-browser and device testing, speed checks, and bug fixes so launch feels solid, not rushed."
      },
      {
        "step": "Launch",
        "description": "Hosting, domain, SSL, and go-live handled carefully so your site is live without drama or downtime."
      },
      {
        "step": "Support & Growth",
        "description": "Training, documentation, and ongoing tweaks so the site stays fast, secure, and easy to update."
      }
    ],
    "stats": [
      {
        "value": "50+",
        "label": "Projects Completed"
      },
      {
        "value": "12+",
        "label": "Years in Business"
      },
      {
        "value": "40+",
        "label": "Active Clients"
      },
      {
        "value": "4.9",
        "label": "Client Rating"
      }
    ],
    "caseStudies": [
      {
        "title": "Real Estate Portal",
        "industry": "Property",
        "result": "Property listing and inquiry management system"
      },
      {
        "title": "Patient Booking System",
        "industry": "Healthcare",
        "result": "Online appointment scheduling for clinics"
      },
      {
        "title": "Inventory Dashboard",
        "industry": "Retail",
        "result": "Stock tracking and reporting for 5 warehouses"
      }
    ],
    "deliveryHeading": "How We Deliver Web Application Development Services",
    "deliveryDescription": "Web application development only pays off when the product is fast, secure, easy to use, and built to scale. At VynTech Solutions, our delivery model is structured, outcome-oriented, and refined across 50+ web and product engagements.\\n\\nWe work in clear phases so discovery is thorough, build quality is high, and launches are predictable. Scope, timelines, architecture, and support are defined upfront, which removes ambiguity and gives stakeholders full visibility from day one.\\n\\nBy pairing human-centric UI/UX design with product-grade engineering, we move your business from fragile websites to a web application that performs, converts, and compounds value release after release.",
    "deliverySteps": [
      {
        "title": "Discovery & Product Strategy",
        "content": "We define product goals, target audience requirements, feature prioritization, system architecture blueprints, and a clear execution roadmap before writing code."
      },
      {
        "title": "UX/UI Design & Prototyping",
        "content": "Our design team crafts intuitive user journeys, wireframes, high-fidelity UI components, and interactive prototypes tailored for high conversion and seamless interaction."
      },
      {
        "title": "Agile Engineering & QA",
        "content": "We build scalable frontend and backend systems using agile 2-week sprints, automated unit/integration testing, continuous code reviews, and frequent demo deployments."
      },
      {
        "title": "Cloud Deployment & DevOps",
        "content": "We establish automated CI/CD pipelines, containerized environments, secure cloud infrastructure, and zero-downtime deployment strategies on AWS, Azure, or GCP."
      },
      {
        "title": "Support, Optimize & Scale",
        "content": "After launch, we continuously monitor app performance, perform security audits, optimize load times, and ship ongoing feature enhancements to support your business growth."
      }
    ]
  },
  "mobile-app-development": {
    "title": "Mobile App Development",
    "subtitle": "iOS & Android Apps",
    "description": "Native and cross-platform mobile apps for iOS and Android. We handle design, development, testing, and app store submission.",
    "heroImage": "/services/mobile-dev.jpg",
    "overview": "We build mobile apps using React Native, Flutter, or native Swift/Kotlin, depending on what makes sense for your project. Most clients choose cross-platform to save time and budget while still getting a quality app on both platforms. We also handle the app store submission process.",
    "features": [
      {
        "title": "iOS Apps",
        "description": "iPhone and iPad apps built with Swift or cross-platform frameworks. App Store submission included.",
        "icon": "apple"
      },
      {
        "title": "Android Apps",
        "description": "Apps for Android phones and tablets. We test on multiple devices to ensure compatibility.",
        "icon": "android"
      },
      {
        "title": "Cross-Platform",
        "description": "One codebase for both iOS and Android using React Native or Flutter. Faster development, lower cost.",
        "icon": "cross"
      },
      {
        "title": "Backend & APIs",
        "description": "Your app needs a server? We build that too, user auth, data storage, push notifications, payments.",
        "icon": "store"
      }
    ],
    "technologies": [
      "React Native",
      "Flutter",
      "Swift",
      "Kotlin",
      "Firebase",
      "Node.js",
      "PostgreSQL",
      "AWS"
    ],
    "process": [
      {
        "step": "Product Discovery",
        "description": "We define who the app is for, the must-have features for v1, and a realistic path to App Store and Play Store."
      },
      {
        "step": "UI/UX Design",
        "description": "Wireframes first, then full mobile screens. You approve the flow on a prototype before development begins."
      },
      {
        "step": "App Development",
        "description": "Native or cross-platform builds with regular test installs on your phone so feedback stays early and clear."
      },
      {
        "step": "Device QA",
        "description": "Real-device testing for speed, crashes, and edge cases across iOS and Android before submission."
      },
      {
        "step": "Store Launch",
        "description": "We handle App Store and Google Play listing, assets, review notes, and approval follow-up."
      },
      {
        "step": "Updates & Care",
        "description": "OS updates, bug fixes, and feature releases so the app stays current after launch day."
      }
    ],
    "stats": [
      {
        "value": "50+",
        "label": "Apps Built"
      },
      {
        "value": "iOS+Android",
        "label": "Both Platforms"
      },
      {
        "value": "4.5+",
        "label": "Avg Store Rating"
      },
      {
        "value": "3-6 mo",
        "label": "Typical Timeline"
      }
    ],
    "caseStudies": [
      {
        "title": "Service Booking App",
        "industry": "Home Services",
        "result": "Booking and payment for local service providers"
      },
      {
        "title": "Delivery Tracking",
        "industry": "Logistics",
        "result": "Real-time tracking for drivers and customers"
      },
      {
        "title": "Membership App",
        "industry": "Fitness",
        "result": "Class booking and member management for gyms"
      }
    ]
  },
  "cloud-solutions": {
    "title": "Cloud Solutions",
    "subtitle": "AWS, Azure & Cloud Infrastructure",
    "description": "Cloud setup, migration, and management. We help you move to the cloud or optimize what you already have.",
    "heroImage": "/services/cloud.jpg",
    "overview": "We work with AWS, Google Cloud, and Azure. Whether you are moving from on-premise servers, setting up a new infrastructure, or trying to reduce your monthly cloud bill, we can help. We focus on practical solutions: reliable hosting, proper security, automated backups, and costs that make sense.",
    "features": [
      {
        "title": "Cloud Setup",
        "description": "New cloud infrastructure from scratch, servers, databases, storage, networking, all configured properly.",
        "icon": "migrate"
      },
      {
        "title": "Migration",
        "description": "Move your existing apps and data to the cloud. We plan it carefully to minimize downtime.",
        "icon": "architecture"
      },
      {
        "title": "Cost Optimization",
        "description": "Already on cloud but bills are high? We audit your setup and find ways to reduce costs.",
        "icon": "serverless"
      },
      {
        "title": "DevOps Setup",
        "description": "CI/CD pipelines, Docker, Kubernetes, automated deployments so your team ships faster.",
        "icon": "multicloud"
      }
    ],
    "technologies": [
      "AWS",
      "Google Cloud",
      "Azure",
      "Docker",
      "Kubernetes",
      "Terraform",
      "GitHub Actions",
      "Linux"
    ],
    "process": [
      {
        "step": "Cloud Assessment",
        "description": "We review your current stack or requirements and identify risks, cost drivers, and the right cloud fit."
      },
      {
        "step": "Architecture Design",
        "description": "Clear architecture, cost estimates, security baseline, and a migration plan if you are moving workloads."
      },
      {
        "step": "Infrastructure Setup",
        "description": "We configure servers, networks, databases, IAM, and monitoring with production-ready defaults."
      },
      {
        "step": "Migration & Cutover",
        "description": "Data and apps move in stages with rollback options so downtime stays short and controlled."
      },
      {
        "step": "Validation",
        "description": "Load, security, and failover checks confirm the environment holds under real traffic."
      },
      {
        "step": "Ops Handover",
        "description": "Runbooks, access, and team training so your staff can manage day-to-day with confidence."
      }
    ],
    "stats": [
      {
        "value": "AWS",
        "label": "Certified Team"
      },
      {
        "value": "50+",
        "label": "Cloud Projects"
      },
      {
        "value": "30-50%",
        "label": "Typical Cost Savings"
      },
      {
        "value": "99.9%",
        "label": "Uptime Target"
      }
    ],
    "caseStudies": [
      {
        "title": "E-commerce Migration",
        "industry": "Retail",
        "result": "Moved from shared hosting to AWS with auto-scaling"
      },
      {
        "title": "Startup Infrastructure",
        "industry": "SaaS",
        "result": "Full AWS setup with CI/CD for a new product"
      },
      {
        "title": "Cost Reduction",
        "industry": "Media",
        "result": "Reduced monthly cloud bill from $8K to $3K"
      }
    ]
  },
  "ai-ml-solutions": {
    "title": "AI/ML Solutions",
    "subtitle": "AI Integration & Automation",
    "description": "Practical AI solutions, chatbots, automation, data analysis, and integrating AI APIs into your existing systems.",
    "heroImage": "/services/ai-ml.jpg",
    "overview": "We help businesses use AI where it actually makes sense. This includes building chatbots, integrating OpenAI/GPT into your apps, automating repetitive tasks, and analyzing data to find useful patterns. We are not here to sell you on AI hype, we focus on practical applications that save time or improve your product.",
    "features": [
      {
        "title": "Chatbots & Assistants",
        "description": "Customer support bots, internal helpdesk assistants, or product Q&A bots using GPT and similar models.",
        "icon": "ml"
      },
      {
        "title": "AI API Integration",
        "description": "Add OpenAI, Claude, or other AI services to your existing software. Text generation, summarization, etc.",
        "icon": "nlp"
      },
      {
        "title": "Document Processing",
        "description": "Extract data from invoices, forms, contracts. OCR + AI to automate manual data entry.",
        "icon": "vision"
      },
      {
        "title": "Data Analysis",
        "description": "Make sense of your data, trends, predictions, anomaly detection. Dashboards you can actually use.",
        "icon": "analytics"
      }
    ],
    "technologies": [
      "Python",
      "OpenAI API",
      "LangChain",
      "TensorFlow",
      "PostgreSQL",
      "Node.js",
      "AWS",
      "Pinecone"
    ],
    "process": [
      {
        "step": "Use-Case Definition",
        "description": "We pin down the business problem, success metrics, and where AI genuinely saves time or improves outcomes."
      },
      {
        "step": "Feasibility Check",
        "description": "We validate data, model options, and ROI. If a simpler automation wins, we say so upfront."
      },
      {
        "step": "Prototype",
        "description": "A working proof of concept you can try with real samples before committing to full build."
      },
      {
        "step": "Build & Guardrails",
        "description": "Production implementation with error handling, prompts, limits, and privacy controls baked in."
      },
      {
        "step": "System Integration",
        "description": "We connect the solution to your apps, CRMs, and workflows so it fits how your team already works."
      },
      {
        "step": "Monitor & Improve",
        "description": "Usage, accuracy, and cost tracking with ongoing tuning as your data and needs evolve."
      }
    ],
    "stats": [
      {
        "value": "30+",
        "label": "AI Projects"
      },
      {
        "value": "GPT-4",
        "label": "Latest Models"
      },
      {
        "value": "2-8 wk",
        "label": "Typical Timeline"
      },
      {
        "value": "ROI Focus",
        "label": "Practical Results"
      }
    ],
    "caseStudies": [
      {
        "title": "Support Chatbot",
        "industry": "E-commerce",
        "result": "Handles 60% of customer questions automatically"
      },
      {
        "title": "Invoice Processing",
        "industry": "Accounting",
        "result": "Extracts data from PDFs, saves 20 hrs/week"
      },
      {
        "title": "Content Generator",
        "industry": "Marketing",
        "result": "AI-assisted product descriptions for 5000+ SKUs"
      }
    ]
  },
  "devops-cicd": {
    "title": "DevOps & CI/CD",
    "subtitle": "Automated Deployments & Infrastructure",
    "description": "Set up automated deployment pipelines, Docker containers, and proper infrastructure so your team can ship code faster.",
    "heroImage": "/services/devops.jpg",
    "overview": "We help development teams deploy code without manual headaches. This means setting up CI/CD pipelines (GitHub Actions, GitLab CI, Jenkins), containerizing apps with Docker, and managing infrastructure with Terraform. The goal: push code, tests run automatically, and it deploys to staging/production without anyone SSH-ing into servers.",
    "features": [
      {
        "title": "CI/CD Pipelines",
        "description": "Automated testing and deployment. Push to main branch, it goes live. No manual steps.",
        "icon": "pipeline"
      },
      {
        "title": "Docker & Containers",
        "description": "Package your app properly so it runs the same everywhere, local, staging, production.",
        "icon": "iac"
      },
      {
        "title": "Infrastructure Setup",
        "description": "Terraform, CloudFormation, your infrastructure defined in code, version controlled.",
        "icon": "container"
      },
      {
        "title": "Monitoring & Logs",
        "description": "Know when things break before users tell you. Alerts, dashboards, log aggregation.",
        "icon": "monitor"
      }
    ],
    "technologies": [
      "GitHub Actions",
      "GitLab CI",
      "Docker",
      "Kubernetes",
      "Terraform",
      "AWS",
      "Datadog",
      "Grafana"
    ],
    "process": [
      {
        "step": "Delivery Audit",
        "description": "We map how you ship today, what breaks often, and where releases slow your team down."
      },
      {
        "step": "Pipeline Design",
        "description": "CI/CD, environments, and infrastructure designed around your stack, not a generic template."
      },
      {
        "step": "Automation Setup",
        "description": "Pipelines, containers, and infra-as-code configured so builds and deploys become routine."
      },
      {
        "step": "Safe Migration",
        "description": "Existing apps move onto the new flow with staged rollouts and clear rollback paths."
      },
      {
        "step": "Observability",
        "description": "Alerts, logs, and dashboards so issues surface before customers feel them."
      },
      {
        "step": "Team Enablement",
        "description": "Docs and hands-on training so your developers own the pipeline with confidence."
      }
    ],
    "stats": [
      {
        "value": "Minutes",
        "label": "Deploy Time"
      },
      {
        "value": "Auto",
        "label": "Rollbacks"
      },
      {
        "value": "40+",
        "label": "Teams Helped"
      },
      {
        "value": "Zero",
        "label": "Manual Deploys"
      }
    ],
    "caseStudies": [
      {
        "title": "Startup Pipeline",
        "industry": "SaaS",
        "result": "From FTP uploads to automated CI/CD in 2 weeks"
      },
      {
        "title": "Docker Migration",
        "industry": "Fintech",
        "result": "Containerized 12 microservices, unified deployment"
      },
      {
        "title": "Multi-Environment",
        "industry": "Agency",
        "result": "Staging, QA, Production, all automated"
      }
    ]
  },
  "ui-ux-design": {
    "title": "UI/UX Design",
    "subtitle": "App & Website Design",
    "description": "User interface design for websites, mobile apps, and web applications. Figma designs your developers can actually build.",
    "heroImage": "/services/design.jpg",
    "overview": "We design interfaces that look good and work well. This means wireframes to figure out the structure, then full visual designs in Figma. We hand off organized files with proper components, spacing, and specs, not messy artboards that leave developers guessing. We can also redesign existing apps that need a refresh.",
    "features": [
      {
        "title": "Website Design",
        "description": "Landing pages, corporate sites, and marketing websites. Clean layouts that communicate clearly.",
        "icon": "research"
      },
      {
        "title": "App Design",
        "description": "Mobile and web app interfaces. Dashboard layouts, user flows, and all the screens you need.",
        "icon": "strategy"
      },
      {
        "title": "Wireframes & Prototypes",
        "description": "Low-fidelity wireframes first, then interactive prototypes you can click through.",
        "icon": "visual"
      },
      {
        "title": "Design Systems",
        "description": "Reusable components, color palettes, typography, keeps your product consistent as it grows.",
        "icon": "prototype"
      }
    ],
    "technologies": [
      "Figma",
      "Adobe XD",
      "Sketch",
      "Photoshop",
      "Illustrator",
      "Principle",
      "Lottie",
      "Zeplin"
    ],
    "process": [
      {
        "step": "Design Brief",
        "description": "We gather goals, users, brand rules, and constraints so the design solves a real product problem."
      },
      {
        "step": "Wireframes",
        "description": "Low-fidelity layouts lock structure and flow before visual polish, saving costly rework later."
      },
      {
        "step": "Visual Design",
        "description": "High-fidelity screens with your brand, real content, and clear hierarchy across key journeys."
      },
      {
        "step": "Interactive Prototype",
        "description": "Clickable flows you can test with stakeholders before a single line of code is written."
      },
      {
        "step": "Iteration",
        "description": "Focused revision rounds based on feedback until the experience feels clear and on-brand."
      },
      {
        "step": "Dev Handoff",
        "description": "Organized Figma files, components, and specs so engineering builds exactly what was approved."
      }
    ],
    "stats": [
      {
        "value": "50+",
        "label": "Projects Designed"
      },
      {
        "value": "Figma",
        "label": "Primary Tool"
      },
      {
        "value": "1-4 wk",
        "label": "Typical Timeline"
      },
      {
        "value": "Dev-Ready",
        "label": "Proper Handoff"
      }
    ],
    "caseStudies": [
      {
        "title": "SaaS Dashboard",
        "industry": "B2B Software",
        "result": "Complete UI for analytics platform, 40+ screens"
      },
      {
        "title": "Mobile App Redesign",
        "industry": "Fitness",
        "result": "Modernized outdated app, improved usability"
      },
      {
        "title": "E-commerce Website",
        "industry": "Fashion",
        "result": "Full website design with product pages and checkout"
      }
    ]
  },
  "ecommerce-solutions": {
    "title": "E-commerce Solutions",
    "subtitle": "Online Stores & Shopping Platforms",
    "description": "Shopify stores, WooCommerce sites, or custom e-commerce platforms. We build online stores that work.",
    "heroImage": "/services/ecommerce.jpg",
    "overview": "We build online stores using Shopify, WooCommerce, or custom solutions depending on your needs and budget. This includes product catalog setup, payment integration (Stripe, PayPal, local gateways), shipping configuration, and the admin tools you need to manage orders. We also handle migrations if you are moving from an existing platform.",
    "features": [
      {
        "title": "Shopify Stores",
        "description": "Custom Shopify themes, app integrations, and store setup. Good for most retail businesses.",
        "icon": "custom"
      },
      {
        "title": "WooCommerce",
        "description": "WordPress-based stores with more flexibility. Good if you need custom functionality.",
        "icon": "platform"
      },
      {
        "title": "Custom E-commerce",
        "description": "Built from scratch when Shopify/WooCommerce does not fit. Full control over everything.",
        "icon": "payment"
      },
      {
        "title": "Payment & Shipping",
        "description": "Stripe, PayPal, local payment methods. Shipping rates, zones, and carrier integrations.",
        "icon": "inventory"
      }
    ],
    "technologies": [
      "Shopify",
      "WooCommerce",
      "Next.js",
      "Stripe",
      "PayPal",
      "Node.js",
      "PostgreSQL",
      "AWS"
    ],
    "process": [
      {
        "step": "Store Discovery",
        "description": "We clarify catalog size, payments, shipping rules, and the growth goals your store must support."
      },
      {
        "step": "Platform Choice",
        "description": "Shopify, WooCommerce, or custom, recommended based on operations, budget, and how you sell."
      },
      {
        "step": "Store Design",
        "description": "Homepage, product pages, cart, and checkout designed to feel trustworthy and convert under load."
      },
      {
        "step": "Build & Configure",
        "description": "Products, taxes, gateways, and shipping wired correctly so orders flow without manual workarounds."
      },
      {
        "step": "Checkout QA",
        "description": "Test orders, payment edge cases, and mobile checkout before a single real customer pays."
      },
      {
        "step": "Go Live",
        "description": "Launch with monitoring so issues are caught early and the store stays stable on busy days."
      }
    ],
    "stats": [
      {
        "value": "50+",
        "label": "Stores Built"
      },
      {
        "value": "Shopify",
        "label": "Partner"
      },
      {
        "value": "2-8 wk",
        "label": "Typical Timeline"
      },
      {
        "value": "All Sizes",
        "label": "10 to 10K Products"
      }
    ],
    "caseStudies": [
      {
        "title": "Fashion Brand",
        "industry": "Apparel",
        "result": "Shopify store with 500+ products, custom theme"
      },
      {
        "title": "Food Delivery",
        "industry": "F&B",
        "result": "WooCommerce with local delivery zones and time slots"
      },
      {
        "title": "B2B Wholesale",
        "industry": "Manufacturing",
        "result": "Custom pricing tiers and bulk order system"
      }
    ]
  },
  "custom-software-development": {
    "title": "Custom Software Development",
    "subtitle": "Business Software & Internal Tools",
    "description": "Custom software built for your specific workflow. When off-the-shelf tools do not fit, we build what you need.",
    "heroImage": "/services/custom.jpg",
    "overview": "Sometimes you need software that does exactly what your business requires, not a generic tool you have to work around. We build custom internal tools, admin panels, workflow automation systems, and business applications. You own the code, and it works the way your business works.",
    "features": [
      {
        "title": "Internal Tools",
        "description": "Admin dashboards, reporting tools, data management systems for your team.",
        "icon": "enterprise"
      },
      {
        "title": "Workflow Automation",
        "description": "Automate repetitive processes. Approvals, notifications, data sync between systems.",
        "icon": "integration"
      },
      {
        "title": "System Integration",
        "description": "Connect your existing tools, CRM, accounting, inventory, so data flows automatically.",
        "icon": "modernize"
      },
      {
        "title": "Legacy Updates",
        "description": "Old system still works but needs updating? We modernize without breaking what works.",
        "icon": "saas"
      }
    ],
    "technologies": [
      "Node.js",
      "Python",
      "React",
      "PostgreSQL",
      "MySQL",
      "Redis",
      "AWS",
      "Docker"
    ],
    "process": [
      {
        "step": "Workflow Discovery",
        "description": "We learn how your team works today, what is manual, and where software can remove friction."
      },
      {
        "step": "Scope Definition",
        "description": "Clear features, roles, and boundaries so the build stays focused and on budget."
      },
      {
        "step": "System Design",
        "description": "Data model, interfaces, and integrations planned around your existing tools and processes."
      },
      {
        "step": "Iterative Build",
        "description": "Working slices delivered regularly so you can steer the product while it is still taking shape."
      },
      {
        "step": "UAT & Hardening",
        "description": "Real scenarios, security checks, and your team's sign-off before anything hits production."
      },
      {
        "step": "Deploy & Train",
        "description": "Go-live, admin training, and early support so adoption sticks after day one."
      }
    ],
    "stats": [
      {
        "value": "50+",
        "label": "Custom Systems"
      },
      {
        "value": "Your Code",
        "label": "Full Ownership"
      },
      {
        "value": "Long-term",
        "label": "Maintainable"
      },
      {
        "value": "1-6 mo",
        "label": "Timeline Range"
      }
    ],
    "caseStudies": [
      {
        "title": "Order Management",
        "industry": "Distribution",
        "result": "Replaced spreadsheets with proper order tracking system"
      },
      {
        "title": "HR Portal",
        "industry": "Services",
        "result": "Leave requests, timesheets, employee directory, all in one place"
      },
      {
        "title": "Booking System",
        "industry": "Healthcare",
        "result": "Custom scheduling for multi-location clinic network"
      }
    ]
  },
  "seo-digital-marketing": {
    "title": "SEO/Digital Marketing",
    "subtitle": "SEO & Online Marketing",
    "description": "Get found on Google. Technical SEO fixes, content that ranks, and marketing that brings real leads, not vanity metrics.",
    "heroImage": "/services/seo.jpg",
    "overview": "We help businesses show up when people search for what they offer. This includes fixing technical SEO issues, optimizing existing pages, creating content that targets relevant keywords, and running Google/Meta ads when paid traffic makes sense. We focus on results you can measure, rankings, traffic, leads, not just reports.",
    "features": [
      {
        "title": "Technical SEO",
        "description": "Site speed, mobile-friendliness, crawl errors, structured data. The foundation stuff.",
        "icon": "technical"
      },
      {
        "title": "On-Page SEO",
        "description": "Keyword research, meta tags, content optimization. Make your pages rank for the right terms.",
        "icon": "content"
      },
      {
        "title": "Content Strategy",
        "description": "Blog posts, landing pages, and content that targets keywords your customers actually search.",
        "icon": "ppc"
      },
      {
        "title": "Google Ads",
        "description": "Search and display campaigns. We manage the ads so you get leads, not wasted budget.",
        "icon": "analytics"
      }
    ],
    "technologies": [
      "Google Search Console",
      "Ahrefs",
      "SEMrush",
      "Google Analytics",
      "Google Ads",
      "Screaming Frog",
      "Surfer",
      "WordPress"
    ],
    "process": [
      {
        "step": "SEO Audit",
        "description": "Technical health, rankings, and competitor gaps reviewed so we know exactly where to start."
      },
      {
        "step": "Quick Wins",
        "description": "Broken links, missing tags, and speed issues fixed first for early measurable lift."
      },
      {
        "step": "Keyword Strategy",
        "description": "Keywords chosen for real search intent and business value, not vanity volume."
      },
      {
        "step": "On-Page & Content",
        "description": "Pages and content optimized so Google understands what you offer and who it is for."
      },
      {
        "step": "Tracking Setup",
        "description": "Analytics and Search Console configured so progress is visible in leads, not just rankings."
      },
      {
        "step": "Ongoing Growth",
        "description": "Monthly optimization, new content, and reporting that keeps momentum compounding."
      }
    ],
    "stats": [
      {
        "value": "40+",
        "label": "SEO Clients"
      },
      {
        "value": "Organic",
        "label": "Focus Area"
      },
      {
        "value": "3-6 mo",
        "label": "Results Timeline"
      },
      {
        "value": "Monthly",
        "label": "Reporting"
      }
    ],
    "caseStudies": [
      {
        "title": "Local Business",
        "industry": "Services",
        "result": "Page 1 rankings for 15 local keywords in 4 months"
      },
      {
        "title": "E-commerce SEO",
        "industry": "Retail",
        "result": "Organic traffic up 180% in 6 months"
      },
      {
        "title": "B2B Lead Gen",
        "industry": "Software",
        "result": "Google Ads campaign generating leads at $45/lead"
      }
    ]
  },
  "maintenance-support": {
    "title": "Maintenance & Support",
    "subtitle": "Ongoing Support & Maintenance",
    "description": "Keep your website or app running. Bug fixes, updates, security patches, and someone to call when things break.",
    "heroImage": "/services/support.jpg",
    "overview": "You have a website or app that needs ongoing care, updates, bug fixes, security patches, small changes. We offer monthly retainer plans so you have developers available when you need them. No need to hire full-time staff for work that is only needed sometimes. We also take over projects built by other teams if you need new support.",
    "features": [
      {
        "title": "Bug Fixes",
        "description": "Something broken? We fix it. Usually within 24-48 hours depending on complexity.",
        "icon": "monitoring"
      },
      {
        "title": "Updates & Patches",
        "description": "Keep your CMS, plugins, and dependencies up to date. Security patches applied promptly.",
        "icon": "security"
      },
      {
        "title": "Small Changes",
        "description": "Need to update content, add a feature, or tweak something? That is what we are here for.",
        "icon": "performance"
      },
      {
        "title": "Monitoring",
        "description": "We set up alerts so we know when your site goes down, often before you do.",
        "icon": "support"
      }
    ],
    "technologies": [
      "WordPress",
      "React",
      "Node.js",
      "AWS",
      "Cloudflare",
      "UptimeRobot",
      "GitHub",
      "Slack"
    ],
    "process": [
      {
        "step": "Access & Review",
        "description": "We take access, review the codebase and hosting, and document how your system actually runs."
      },
      {
        "step": "Retainer Setup",
        "description": "Hours, priorities, and response times agreed upfront so support is predictable, not reactive chaos."
      },
      {
        "step": "Request Channel",
        "description": "A simple intake via email or Slack with tracking, so nothing gets lost between conversations."
      },
      {
        "step": "Ongoing Care",
        "description": "Updates, backups, security patches, and fixes handled on a steady monthly cadence."
      },
      {
        "step": "Monthly Reporting",
        "description": "A clear summary of what we shipped, what we watched, and what we recommend next."
      },
      {
        "step": "Priority Response",
        "description": "Urgent issues get defined SLAs so someone real is reachable when something is down."
      }
    ],
    "stats": [
      {
        "value": "40+",
        "label": "Active Clients"
      },
      {
        "value": "< 24hr",
        "label": "Response Time"
      },
      {
        "value": "Monthly",
        "label": "Retainer Plans"
      },
      {
        "value": "No Lock-in",
        "label": "Cancel Anytime"
      }
    ],
    "caseStudies": [
      {
        "title": "E-commerce Store",
        "industry": "Retail",
        "result": "Ongoing Shopify support, 10-15 requests/month"
      },
      {
        "title": "Company Website",
        "industry": "Professional Services",
        "result": "WordPress maintenance and content updates"
      },
      {
        "title": "Web App Takeover",
        "industry": "SaaS",
        "result": "Took over codebase from previous agency, ongoing development"
      }
    ]
  },
  "tax-accounting": {
    "title": "Tax & Accounting Services",
    "subtitle": "Financial & Tax Solutions",
    "description": "Comprehensive tax planning, accounting, and financial services for businesses and individuals. From tax filing to CFO services, we handle your numbers.",
    "heroImage": "/services/tax.jpg",
    "overview": "We provide end-to-end financial services including tax preparation, bookkeeping, financial planning, and CFO advisory. Whether you're a startup needing incorporation help, a growing business requiring financial forecasting, or an established company looking for tax optimization, our team of certified professionals delivers accurate, compliant, and strategic financial guidance.",
    "features": [
      {
        "title": "Comprehensive Tax & Accounting",
        "description": "Corporate and personal tax filing, GST/HST, payroll taxes, and year-round tax planning to minimize your liability.",
        "icon": "analytics"
      },
      {
        "title": "Business Incorporation & CFO Services",
        "description": "Company formation, corporate structure advice, and part-time CFO services for strategic financial leadership.",
        "icon": "enterprise"
      },
      {
        "title": "Financial Planning & Forecasting",
        "description": "Cash flow projections, budgeting, financial modeling, and scenario planning to guide business decisions.",
        "icon": "speed"
      },
      {
        "title": "Strategic Investment Planning",
        "description": "Investment strategy, portfolio review, retirement planning, and wealth building guidance for business owners.",
        "icon": "integration"
      },
      {
        "title": "Generational Wealth & Estate Planning",
        "description": "Succession planning, estate tax strategies, trusts, and wealth transfer to protect your family's future.",
        "icon": "security"
      },
      {
        "title": "Government Grants Assistance",
        "description": "SR&ED claims, CEWS, CEBA, and other government programs. We help you claim what you're entitled to.",
        "icon": "support"
      },
      {
        "title": "Financial Audits & Compliance",
        "description": "Audit preparation, internal controls review, and compliance with regulatory requirements.",
        "icon": "monitoring"
      }
    ],
    "technologies": [
      "QuickBooks",
      "Xero",
      "Sage",
      "FreshBooks",
      "Excel",
      "CRA Portal",
      "TaxCycle",
      "CaseWare"
    ],
    "process": [
      {
        "step": "Financial Consultation",
        "description": "We review your current books, tax position, and goals so advice starts from your real numbers."
      },
      {
        "step": "Books Assessment",
        "description": "Gaps, risks, and cleanup opportunities identified before filing or planning decisions."
      },
      {
        "step": "Tax Strategy",
        "description": "A practical plan for filings, deductions, and timing tailored to your business structure."
      },
      {
        "step": "Implementation",
        "description": "Returns filed, systems set up, and the plan put into motion with clear deadlines."
      },
      {
        "step": "Ongoing Monitoring",
        "description": "Rules and your business change, we adjust so compliance and savings stay aligned."
      },
      {
        "step": "Clear Reporting",
        "description": "Regular summaries so you always know where cash, tax, and obligations stand."
      }
    ],
    "stats": [
      {
        "value": "40+",
        "label": "Clients Served"
      },
      {
        "value": "$2M+",
        "label": "Tax Savings"
      },
      {
        "value": "12+",
        "label": "Years Experience"
      },
      {
        "value": "CPA",
        "label": "Certified Team"
      }
    ],
    "caseStudies": [
      {
        "title": "Tech Startup",
        "industry": "Technology",
        "result": "Saved $120K in taxes through SR&ED claims and proper structure"
      },
      {
        "title": "Restaurant Group",
        "industry": "Hospitality",
        "result": "Streamlined accounting for 5 locations, reduced overhead 30%"
      },
      {
        "title": "Real Estate Investor",
        "industry": "Property",
        "result": "Estate planning saved $500K in potential inheritance taxes"
      }
    ]
  }
};

function enrichServices(data: Record<string, ServiceData>): Record<string, ServiceData> {
  const out: Record<string, ServiceData> = {};

  for (const [slug, service] of Object.entries(data)) {
    const pageSections = service.pageSections || servicePageSectionsBySlug[slug];
    const showTechStack =
      typeof service.showTechStack === "boolean"
        ? service.showTechStack
        : slug !== "tax-accounting" && slug !== "seo-digital-marketing";

    const techStack =
      service.techStack ||
      pageSections?.techStack ||
      (showTechStack ? defaultTechStack : undefined);

    const canadaCities =
      service.canadaCities ||
      pageSections?.canadaCities;

    const whyExtras =
      !service.whyChooseUsHeading
        ? slug === "tax-accounting"
          ? TAX_WHY_CHOOSE
          : DEFAULT_WHY_CHOOSE
        : {};

    out[slug] = {
      ...service,
      ...whyExtras,
      icon: service.icon || SERVICE_ICON_BY_SLUG[slug] || "code",
      heroVariant: service.heroVariant || HERO_VARIANT_BY_SLUG[slug] || "browser",
      heroCtaLabel: service.heroCtaLabel || defaultServiceChrome.heroCtaLabel,
      featuresEyebrow: service.featuresEyebrow || defaultServiceChrome.featuresEyebrow,
      ctaHeading: service.ctaHeading || defaultServiceChrome.ctaHeading,
      ctaBody: service.ctaBody || defaultServiceChrome.ctaBody,
      ctaButtonLabel: service.ctaButtonLabel || defaultServiceChrome.ctaButtonLabel,
      deliveryEyebrow: service.deliveryEyebrow || defaultServiceChrome.deliveryEyebrow,
      overviewTagline: service.overviewTagline || DEFAULT_OVERVIEW_TAGLINE,
      processHeading: service.processHeading || "How We Work",
      faqs: service.faqs?.length ? service.faqs : DEFAULT_SERVICE_FAQS,
      showTechStack,
      techStack,
      pageSections,
      canadaCities,
    };
  }

  return out;
}

export const servicesData: Record<string, ServiceData> = enrichServices(baseServicesData);
