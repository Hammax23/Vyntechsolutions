/**
 * One-shot patcher: merge remaining Strapi service blocks + city copy
 * into cms/data/seed.json from the current frontend fallbacks.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const seedPath = join(root, "cms/data/seed.json");
const seed = JSON.parse(readFileSync(seedPath, "utf8"));

const defaultTechStack = {
  heading: "Technology Stack",
  description:
    "We work with a wide range of modern, cutting-edge technologies. From programming languages and frameworks to databases, cloud platforms, and testing environments, our flexible tech stack ensures applications remain scalable, secure, and high-performing as businesses grow.",
  categories: [
    {
      categoryId: "frontend",
      name: "FRONTEND",
      items: [
        { name: "React", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
        { name: "Next.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
        { name: "Vue.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg" },
        { name: "TypeScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
        { name: "JavaScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
        { name: "Tailwind", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" },
        { name: "Bootstrap", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg" },
      ],
    },
    {
      categoryId: "backend",
      name: "BACKEND",
      items: [
        { name: "Node.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
        { name: "Express", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
        { name: "Laravel", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg" },
        { name: "PHP", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" },
        { name: "Python", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
        { name: "Flask", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg" },
      ],
    },
    {
      categoryId: "database",
      name: "DATABASE",
      items: [
        { name: "PostgreSQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
        { name: "MongoDB", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
        { name: "Redis", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" },
        { name: "MySQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
        { name: "Firebase", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" },
      ],
    },
    {
      categoryId: "infra",
      name: "INFRA AND DEVOPS",
      items: [
        { name: "AWS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg" },
        { name: "Azure", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg" },
        { name: "Docker", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
        { name: "Kubernetes", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg" },
        { name: "Git", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
        { name: "GraphQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg" },
      ],
    },
    {
      categoryId: "design",
      name: "DESIGN",
      items: [{ name: "Figma", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" }],
    },
  ],
};

const engagementStrategies = [
  { strategyId: "content", title: "Engaging Content", description: "Quality content is the backbone of any successful digital presence. We craft compelling, SEO-optimized copy that resonates with your local audience and drives action.", calloutTitle: "Struggling with Bounce Rates?", calloutText: "Compelling content keeps visitors engaged. Let our team write copy that converts." },
  { strategyId: "cta", title: "Call-To-Actions", description: "This feature has the power to compel your customers. Higher interaction and traffic can be achieved with the help of compelling CTAs that create a sense of urgency for the website visitors. For the architecture of a CTA, we follow a proper format. With comprehensive expertise in broader portfolios, our accomplished team will ensure maximum leverage from your portal.", calloutTitle: "Struggling with Low Conversions?", calloutText: "Effective CTAs can change that. Let VynTech Solutions design the perfect CTAs to boost your sales. Contact us now!" },
  { strategyId: "blog", title: "Informative Blog", description: "An active, informative blog establishes your authority and keeps your website fresh for search engines. We implement scalable blog architectures that attract organic traffic over time.", calloutTitle: "Need More Organic Traffic?", calloutText: "A strategic blog can multiply your inbound leads. Ask us about our content strategy services." },
  { strategyId: "mobile", title: "Mobile Responsive", description: "With the majority of local searches happening on mobile devices, a seamless mobile experience is non-negotiable. Our designs are fluid, adapting perfectly to any screen size for maximum engagement.", calloutTitle: "Losing Mobile Customers?", calloutText: "Don't let a poor mobile experience cost you sales. We build mobile-first designs." },
  { strategyId: "functionality", title: "Proper Functionality", description: "Broken links, slow load times, and clunky navigation frustrate users. We rigorously test all features to ensure flawless performance that builds trust with your visitors.", calloutTitle: "Is Your Site Slow or Buggy?", calloutText: "Technical issues kill conversions. Let us optimize your site's performance today." },
  { strategyId: "media", title: "Rich Media", description: "High-quality images, videos, and interactive elements capture attention faster than text alone. We integrate optimized rich media that enhances your message without slowing down your site.", calloutTitle: "Want to Stand Out Visually?", calloutText: "Engage visitors instantly with custom graphics and optimized video content." },
  { strategyId: "social", title: "Integrating Social Media", description: "Connect your website directly to your social channels. We build seamless integrations that encourage sharing, social proof, and community growth right from your landing pages.", calloutTitle: "Looking to Grow Your Following?", calloutText: "Turn website visitors into loyal followers with integrated social strategies." },
  { strategyId: "consumer", title: "Consumer-Centric Design", description: "We don't just design for looks; we design for your specific user. By analyzing user behavior, we create intuitive journeys that guide visitors naturally toward becoming customers.", calloutTitle: "Are Users Getting Lost?", calloutText: "Streamline your user journey with our UX/UI design expertise." },
];

const cityFaqs = [
  { question: "Why do I need professional {service} services in {city}?", answer: "{city} is a highly competitive market. Having a professional {service} strategy ensures your business stands out locally, attracts the right audience, and converts visitors into loyal customers." },
  { question: "How long does a typical {service} project take?", answer: "The timeline depends on the scope and complexity of your requirements. Once we evaluate your business goals during our free consultation, we provide a clear, transparent timeline with milestones." },
  { question: "Do you have experience working with businesses in {city}?", answer: "Yes, we have extensive experience working with companies across {city} in various industries. We understand the local market dynamics and tailor our strategies to match regional consumer behavior." },
  { question: "What makes VynTech Solutions different from other agencies in {city}?", answer: "We don't just deliver a service; we act as your technology partner. Our team focuses on ROI-driven results, transparent communication, and building long-term scalable solutions for your business." },
  { question: "How do we get started?", answer: "Getting started is easy! Simply reach out to us using the 'Let's Talk Business' button below. We'll schedule a free consultation to discuss your needs and outline the perfect strategy." },
];

const cityHero = {
  eyebrowTemplate: "{service} in {city}",
  headlineTemplate: "{service} Services in {city}",
  subheadingTemplate: "{description} We are the trusted local partner for businesses in {city}.",
  ctaLabel: "Request a Free Quote",
  whyChooseHeadingTemplate: "Why Choose Us for {service} in {city}?",
  whyChooseBodyTemplate: "Our team is dedicated to providing high-quality digital solutions tailored specifically for the {city} market. Let us help you dominate your local industry.",
  engagementHeadingTemplate: "How Will We Increase Engagement Through {service}",
  aboutEyebrowTemplate: "About {city}",
  aboutHeadingTemplate: "{service} for {city} Businesses",
  aboutBodyTemplate:
    "{city} is a highly competitive digital market, with hundreds of thousands of businesses all fighting for the same Google searches. A generic digital presence won't cut it here. VynTech Solutions builds custom, conversion-focused {service} campaigns for {city} businesses that are engineered to rank, load fast, and turn visitors into paying customers. We understand the {city} market deeply. Our strategies are tailored to local neighbourhoods and business verticals, so you're not just getting traffic, you're getting the right traffic. With five-star reviews and clients across every major industry, we're the agency that {city} businesses trust to grow online.",
  industriesHeadingTemplate: "Industries We Serve in {city}",
  sidebarHeadingTemplate: "Why {city} Businesses Choose VynTech",
  sidebarItems: [
    "{city}'s leading {service} agency",
    "Custom strategies engineered to dominate the {city} market",
    "Local market expertise and dedicated support",
    "Mobile-first approach, capturing local smartphone searches",
  ],
  hoursText: "Mon to Fri: 9:00 AM to 6:00 PM EST",
  quoteCtaTemplate: "Get a Free {city} Quote",
  bottomCtaHeadingTemplate: "Ready to Grow Your Business in {city}?",
  bottomCtaBodyTemplate: "Contact us today to discuss your {service} project. We provide custom quotes and transparent timelines.",
  bottomCtaLabel: "Let's Talk Business",
  faqEyebrow: "FAQ",
  faqHeading: "Frequently asked questions",
  faqIntroTemplate: "Everything you need to know about our {service} services in {city}.",
  rankingEyebrow: "What We Optimize",
  rankingHeadingTemplate: "Dominating the {city} Search Results",
  rankingDescription: "Ranking in the local map pack requires a precise, technical approach. Here is exactly what we optimize to push your business to the top of Google.",
  rankingItems: [
    { title: "Google Business Profile", desc: "Full optimization of your GBP, including categories, attributes, products, and regular geo-tagged posts to boost relevance.", iconKey: "gbp" },
    { title: "Local Citations", desc: "Building consistent NAP (Name, Address, Phone) citations across high-authority directories specifically relevant to your area.", iconKey: "citations" },
    { title: "On-Page Localization", desc: "Injecting hyper-local keywords, schema markup, and neighborhood references directly into your website's architecture.", iconKey: "onpage" },
    { title: "Review Management", desc: "Implementing automated systems to generate positive reviews from your best clients, a major ranking signal for local SEO.", iconKey: "reviews" },
  ],
  advantageHeadingTemplate: "Ready to Capture the {city} Market?",
  advantageBody: "46% of all Google searches have local intent. If you aren't visible when local customers search for your services, you're handing revenue directly to your competitors. Let's fix that.",
  advantageCtaPrimary: "Get a Free Local SEO Audit",
  advantageCtaSecondary: "Speak with a Strategist",
  advantageStats: [
    { value: "97%", label: "Of people learn more about a local company online than anywhere else." },
    { value: "88%", label: "Of local mobile searches result in a call or visit within 24 hours." },
  ],
};

const canadaCities = {
  heading: "Services Across Canada",
  description: "We serve businesses in every major Canadian city. Click your city to learn more about our local services.",
  cities: ["Toronto", "Vancouver", "Calgary", "Ottawa", "Mississauga", "Brampton", "Edmonton", "Hamilton"],
};

const bySlug = {
  "mobile-app-development": {
    mobileTabsBlock: {
      eyebrow: "What We Offer",
      heading: "Mobile App Development Services",
      description: "End-to-end native and cross-platform mobile engineering tailored to deliver high performance, robust security, and seamless user experiences.",
      tabs: [
        { tabId: "ios", name: "iOS App Development", highlightText: "iOS app development services", title: "iOS App Development", description: "As a mobile application development company in Canada, we provide iOS app development services using Swift and SwiftUI, with a focus on performance, privacy, and smooth App Store approvals.", points: [{ title: "System integration", text: "iOS builds are developed to connect with CRMs and ERPs. This helps Canadian businesses to keep processes linked instead of relying on disconnected tools." }, { title: "Scalable setup", text: "Modular codebases and CI/CD pipelines are built in from the start, making it easier for enterprises to handle rising traffic without constant rebuilds." }] },
        { tabId: "android", name: "Android App Development", highlightText: "Android app development services", title: "Android App Development", description: "We provide native Android app development services using Kotlin and Jetpack Compose, delivering fast, scalable, and secure Android applications tailored for the Canadian market.", points: [{ title: "Hardware & OS optimization", text: "Android apps are fine-tuned for diverse hardware configurations, battery efficiency, and seamless background processing." }, { title: "Google Play compliance", text: "Strict adherence to Google Play Store security guidelines and Vitals benchmarks ensures high search visibility and seamless releases." }] },
        { tabId: "react-native", name: "React Native App Development", highlightText: "React Native app development", title: "React Native App Development", description: "We engineer high-performance cross-platform apps using React Native, giving your enterprise full native capabilities combined with modern React developer velocity.", points: [{ title: "Native component architecture", text: "React Native bridges JavaScript logic directly to native iOS and Android components for zero compromise on speed or feel." }, { title: "Over-the-air updates", text: "Deploy immediate patch updates and feature enhancements directly to users without waiting for app store review cycles." }] },
        { tabId: "web-app", name: "Web App Development", highlightText: "mobile web app development", title: "Web App Development", description: "We build Progressive Web Applications (PWAs) and mobile-first web software that deliver native-like responsiveness, offline access, and fast loading speeds.", points: [{ title: "Cross-browser accessibility", text: "Responsive web apps that run seamlessly across all mobile browsers without requiring store downloads." }, { title: "Offline capability", text: "Service workers and local storage allow users to access critical features even in low or no network environments." }] },
      ],
    },
  },
  "ui-ux-design": {
    uiuxEngagementsBlock: {
      eyebrow: "UI/UX Engagements",
      heading: "Four types of UI/UX engagements we run",
      items: [
        { title: "UX audit and recommendations", description: "An analysis of your current interface, identifying friction points and a report prioritized by impact on conversion. Delivered as a standalone engagement or built into a larger project." },
        { title: "Wireframes and architecture", description: "Navigation structure, information hierarchy and functional mockups before the visual design. This step avoids costly revisions down the line." },
        { title: "Interactive prototypes", description: "Clickable mockups and functional prototypes to validate the user experience before development. Quick tests and low-cost iterations." },
        { title: "Full UI/UX design", description: "End-to-end design covering research, wireframes, visual UI, design systems, and handoff-ready assets. The complete package for a polished, pixel-perfect product." },
      ],
    },
  },
  "ecommerce-solutions": {
    ecommerceServicesBlock: {
      eyebrow: "Our Services",
      heading: "End-to-End Ecommerce Development Services",
      description: "As a trusted ecommerce development company, we design, build, and optimize powerful online stores that drive revenue, improve user experience, and integrate seamlessly with your business systems.",
      items: [
        { num: "01", title: "Custom Storefront Development", desc: "Fully tailored custom ecommerce website development aligned with your brand and sales goals." },
        { num: "02", title: "Platform-Agnostic Builds", desc: "Flexible ecommerce site development across Shopify, WooCommerce, Magento, and custom stacks." },
        { num: "03", title: "UX & Conversion Design", desc: "High-impact ecommerce website design and development focused on usability and checkout flow." },
        { num: "04", title: "Backend & API Integrations", desc: "Reliable integrations with ERP, CRM, inventory, shipping, and payment systems." },
      ],
    },
  },
  "seo-digital-marketing": {
    localSeoBlock: {
      whyHeading: "Why Our Local SEO Works",
      whyParagraphs: [
        "Most affordable SEO services cut corners, thin content, low-quality backlinks, and cookie-cutter audits. We don't. Our local SEO services in Toronto and across Canada are built on three pillars: technical excellence, hyper-local content, and authoritative link earning.",
        'When someone in Toronto searches "local SEO services near me," your business should be the first thing they see. We make that happen through Google Business Profile optimization, structured data markup, local citation building, and neighbourhood-level keyword targeting, the kind of work that moves the needle.',
      ],
      stats: [
        { value: "312%", label: "Avg. traffic increase" },
        { value: "24+", label: "Cities served" },
        { value: "200+", label: "Google Business Profiles optimized" },
        { value: "18 spots", label: "Avg. ranking improvement" },
      ],
      specialistsEyebrow: "Local SEO Specialists",
      citiesHeading: "Local SEO Services Toronto & Across Canada",
      citiesDescription: "We provide sophisticated local SEO services to businesses in every major Canadian city. Our targeted strategies help you dominate the Google Maps pack and rank for searches that actually convert.",
      cities: ["Toronto", "Brampton", "Mississauga", "North York", "Calgary", "Vancouver", "Ottawa", "Hamilton"],
      ctaHeading: "Ready to Grow Your Organic Traffic?",
      ctaBody: "Every SEO engagement is scoped to your market, goals, and competition. Get a free strategy call and custom quote, no contracts, no lock-in.",
      ctaLabel: "Request a Free Quote",
    },
  },
  "cloud-solutions": {
    cloudIncludedBlock: {
      heading: "Enterprise Cloud Deliverables",
      description: "Beyond basic cloud setup, we engineer production-ready cloud standards that guarantee uptime, security, and cost efficiency:",
      items: [
        { itemId: "auto-scaling", title: "High-Availability & Auto-Scaling", description: "Architecting zero-downtime, multi-region cloud infrastructures equipped with horizontal auto-scaling and intelligent load balancing to absorb traffic surges effortlessly.", points: ["Multi-AZ fault tolerance & load balancing", "Traffic-triggered horizontal auto-scaling", "99.99% Guaranteed SLA Uptime Target"] },
        { itemId: "iac-automation", title: "IaC & CI/CD Release Automation", description: "Eliminating manual server management using Terraform, GitHub Actions, and containerization so code moves seamlessly from commit to production.", points: ["Terraform & CloudFormation state control", "Automated testing & deployment pipelines", "Instant environment duplication & rollbacks"] },
        { itemId: "cyber-security", title: "Cyber Security & Regulatory Compliance", description: "Hardening cloud environments with zero-trust network policies, data encryption at rest and in transit, and continuous compliance audit readiness.", points: ["End-to-end KMS data encryption & IAM policies", "Automated WAF & DDoS threat protection", "SOC 2, ISO 27001 & HIPAA audit readiness"] },
        { itemId: "finops-cost", title: "FinOps Spend & Cost Optimization", description: "Proactively managing monthly cloud bills through rightsizing idle compute nodes, savings plans, and automated resource cleanup triggers.", points: ["Savings Plans & Reserved Instance optimization", "Automated idle server shutdown triggers", "30-50% average cloud bill reduction"] },
        { itemId: "observability", title: "24/7 Observability & Managed SLA", description: "Deep telemetry monitoring across metrics, logs, and APM traces to resolve latency bottlenecks before end users encounter any issues.", points: ["Real-time Prometheus & Grafana alerting", "Centralized log aggregation & tracing", "24/7 automated incident response SLAs"] },
      ],
    },
  },
  "ai-ml-solutions": {
    aiMlGridBlock: {
      eyebrow: "Best AI/ML Services in Canada",
      heading: "Enterprise AI & ML Capabilities",
      intro: [
        "From intelligent chatbots to custom predictive algorithms, we deliver end-to-end AI capabilities that drive business growth. Our artificial intelligence and machine learning solutions empower organizations to unlock hidden data patterns, automate complex operational workflows, and enhance customer experiences across all touchpoints.",
        "By leveraging state-of-the-art neural networks, natural language processing, and advanced predictive analytics, we build resilient AI infrastructure tailored to your exact business objectives. Whether you are modernizing legacy operations or deploying next-generation Generative AI models, our engineering team ensures seamless scalability, robust enterprise security, and measurable ROI at every stage of development.",
      ],
      items: [
        { itemId: "chatbot", title: "Customer Service Automation", description: "Automate customer interactions using NLP and intelligent chatbots to reduce human workload, improve response times, and ensure 24/7 availability with consistent support experiences." },
        { itemId: "analytics", title: "Data Analytics & Business Intelligence", description: "Unlock the value of your enterprise data with advanced analytics dashboards and visualization tools that reveal performance trends and uncover growth opportunities." },
        { itemId: "process", title: "Process Automation & Optimization", description: "Streamline repetitive tasks and complex operational workflows using AI and ML automation to reduce manual costs, eliminate errors, and boost team output." },
        { itemId: "strategy", title: "AI/ML Strategy & Consulting", description: "Design and implement tailored AI roadmaps aligned with business goals, focusing on high-ROI use cases, scalable architectures, and responsible AI innovation." },
        { itemId: "predictive", title: "Predictive Analytics & Forecasting", description: "Forecast market demand, user churn, and inventory trends through custom machine learning models trained on historical data to drive proactive decision-making." },
        { itemId: "llm", title: "Custom LLM & Generative AI Integration", description: "Fine-tune and integrate state-of-the-art Large Language Models (LLMs) and Generative AI into your applications for document processing, content generation, and smart search." },
      ],
    },
  },
  "devops-cicd": {
    devopsGridBlock: {
      eyebrow: "Our Services",
      heading: "Our Comprehensive DevOps Services",
      description: "We provide end-to-end DevOps support, from initial assessment and strategy to implementation and ongoing management, helping you mature your software delivery lifecycle.",
      items: [
        { num: "01", title: "CI/CD Pipeline Automation", desc: "We design and build robust, automated CI/CD pipelines that enable you to test and deploy your code frequently and reliably with zero downtime." },
        { num: "02", title: "Infrastructure as Code (IaC)", desc: "We use tools like Terraform and Ansible to manage your infrastructure as code, enabling versioning, repeatability, and scalability." },
        { num: "03", title: "Cloud Automation & Management", desc: "We help you leverage the full power of the cloud (AWS, Azure, GCP) by automating resource provisioning, configuration, and management." },
        { num: "04", title: "Monitoring & Observability", desc: "We implement comprehensive monitoring and observability solutions that give you deep visibility into your systems' health and performance." },
        { num: "05", title: "DevSecOps & Security", desc: "We integrate security into every stage of your development lifecycle, from code scanning to compliance automation, to build more secure applications." },
        { num: "06", title: "Site Reliability Engineering (SRE)", desc: "We apply SRE principles to improve your systems' reliability, performance, and resilience, ensuring you meet your service level objectives (SLOs)." },
      ],
    },
  },
  "web-development": {
    canadaCitiesBlock: {
      heading: "Web Development Services Across Canada",
      description: "We serve businesses in every major Canadian city. Click your city to learn more about our local web development services.",
      cities: ["Toronto", "Vancouver", "Calgary", "Ottawa", "Mississauga", "Brampton", "Edmonton", "Hamilton"],
    },
  },
};

for (const service of seed.services || []) {
  const extra = bySlug[service.slug] || {};
  Object.assign(service, extra);
  if (!service.techStackBlock) service.techStackBlock = defaultTechStack;
  if (!service.canadaCitiesBlock) service.canadaCitiesBlock = { ...canadaCities, heading: `${service.title} Services Across Canada` };
  if (!service.cityHero) service.cityHero = cityHero;
  if (!service.engagementStrategies) service.engagementStrategies = engagementStrategies;
  if (!service.cityFaqs) service.cityFaqs = cityFaqs;
  if (!service.caseStudiesHeading) service.caseStudiesHeading = "Case Studies";
}

if (seed.homepage) {
  seed.homepage.servicesLearnMoreLabel = seed.homepage.servicesLearnMoreLabel || "Learn More";
}

if (seed.formConfig) {
  seed.formConfig.pageBenefits = seed.formConfig.pageBenefits || [
    { icon: "clock", title: "Quick Response", description: "Get a response within 24 hours from our dedicated team" },
    { icon: "shield", title: "NDA Protection", description: "Your ideas are safe with our strict confidentiality agreements" },
    { icon: "users", title: "Expert Consultation", description: "Free consultation with our senior technical architects" },
    { icon: "chart", title: "Custom Proposal", description: "Detailed project proposal tailored to your requirements" },
  ];
  seed.formConfig.pageStats = seed.formConfig.pageStats || [
    { value: "50+", label: "Projects Delivered" },
    { value: "40+", label: "Happy Clients" },
    { value: "4+", label: "Countries Served" },
    { value: "12+", label: "Years Experience" },
  ];
}

const blogPage = (seed.staticPages || []).find((p) => p.slug === "blog");
if (blogPage) {
  blogPage.sections = {
    ...(blogPage.sections || {}),
    ctaHeading: "Have a Project in Mind?",
    ctaBody: "Let's discuss how we can help build your software solution.",
    ctaLabel: "Get in Touch",
  };
}

writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n");
console.log(`Patched ${seed.services.length} services + homepage + formConfig + blog CTA`);
