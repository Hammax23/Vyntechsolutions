export type ServicePageSections = {
  mobileTabs?: {
    eyebrow?: string;
    heading?: string;
    description?: string;
    tabs: Array<{
      id: string;
      name: string;
      highlightText?: string;
      title: string;
      description: string;
      points: { title: string; text: string }[];
    }>;
  };
  uiuxEngagements?: {
    eyebrow?: string;
    heading?: string;
    items: { title: string; description: string }[];
  };
  ecommerceServices?: {
    eyebrow?: string;
    heading?: string;
    description?: string;
    items: { num?: string; title: string; desc: string }[];
  };
  seoPackages?: {
    eyebrow?: string;
    heading?: string;
    description?: string;
    footerNote?: string;
    customPackageText?: string;
    customPackageCtaLabel?: string;
    packages: Array<{
      name: string;
      blurb?: string;
      price: string;
      priceSuffix?: string;
      featured?: boolean;
      featuredBadge?: string;
      ctaLabel?: string;
      features: string[];
    }>;
  };
  localSeo?: {
    whyHeading?: string;
    whyParagraphs?: string[];
    stats?: { value: string; label: string }[];
    specialistsEyebrow?: string;
    citiesHeading?: string;
    citiesDescription?: string;
    cities?: string[];
    ctaHeading?: string;
    ctaBody?: string;
    ctaLabel?: string;
  };
  cloudIncluded?: {
    heading?: string;
    description?: string;
    items: Array<{
      id: string;
      title: string;
      description: string;
      points: string[];
    }>;
  };
  aiMlGrid?: {
    eyebrow?: string;
    heading?: string;
    intro?: string[];
    items: { id?: string; title: string; description: string }[];
  };
  devopsGrid?: {
    eyebrow?: string;
    heading?: string;
    description?: string;
    items: { num?: string; title: string; desc: string }[];
  };
  techStack?: {
    heading?: string;
    description?: string;
    categories: Array<{
      id: string;
      name: string;
      items: { name: string; logo?: string }[];
    }>;
  };
  canadaCities?: {
    heading?: string;
    description?: string;
    cities: string[];
  };
  engagementStrategies?: Array<{
    id: string;
    title: string;
    description: string;
    calloutTitle: string;
    calloutText: string;
  }>;
  cityEngagement?: Array<{
    id: string;
    title: string;
    description: string;
    calloutTitle: string;
    calloutText: string;
  }>;
  cityFaqs?: Array<{
    question: string;
    answer: string;
  }>;
};

export const defaultCityEngagementStrategies: NonNullable<
  ServicePageSections["engagementStrategies"]
> = [
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

export const defaultServiceChrome = {
  heroCtaLabel: "Get a Free Consultation",
  featuresEyebrow: "What We Offer",
  ctaHeading: "Ready To Get Started?",
  ctaBody:
    "Let's discuss how our {title} services can help transform your business.",
  ctaButtonLabel: "Transform Your Digital Presence",
  deliveryEyebrow: "Delivery Framework",
};

export const defaultTechStack: NonNullable<ServicePageSections["techStack"]> = {
  heading: "Technology Stack",
  description:
    "We work with a wide range of modern, cutting-edge technologies. From programming languages and frameworks to databases, cloud platforms, and testing environments, our flexible tech stack ensures applications remain scalable, secure, and high-performing as businesses grow.",
  categories: [
    {
      id: "frontend",
      name: "FRONTEND",
      items: [
        {
          name: "React",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
        },
        {
          name: "Next.js",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
        },
        {
          name: "Vue.js",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg",
        },
        {
          name: "TypeScript",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
        },
        {
          name: "JavaScript",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
        },
        {
          name: "Tailwind",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg",
        },
        {
          name: "Bootstrap",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg",
        },
      ],
    },
    {
      id: "backend",
      name: "BACKEND",
      items: [
        {
          name: "Node.js",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
        },
        {
          name: "Express",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
        },
        {
          name: "Laravel",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg",
        },
        {
          name: "PHP",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
        },
        {
          name: "Python",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
        },
        {
          name: "Flask",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg",
        },
      ],
    },
    {
      id: "database",
      name: "DATABASE",
      items: [
        {
          name: "PostgreSQL",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
        },
        {
          name: "MongoDB",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
        },
        {
          name: "Redis",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg",
        },
        {
          name: "MySQL",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
        },
        {
          name: "Firebase",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg",
        },
      ],
    },
    {
      id: "infra",
      name: "INFRA AND DEVOPS",
      items: [
        {
          name: "AWS",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg",
        },
        {
          name: "Azure",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg",
        },
        {
          name: "Docker",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
        },
        {
          name: "Kubernetes",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg",
        },
        {
          name: "Git",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
        },
        {
          name: "GraphQL",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg",
        },
      ],
    },
    {
      id: "design",
      name: "DESIGN",
      items: [
        {
          name: "Figma",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",
        },
      ],
    },
  ],
};

export const servicePageSectionsBySlug: Record<string, ServicePageSections> = {
  "mobile-app-development": {
    mobileTabs: {
      eyebrow: "What We Offer",
      heading: "Mobile App Development Services",
      description:
        "End-to-end native and cross-platform mobile engineering tailored to deliver high performance, robust security, and seamless user experiences.",
      tabs: [
        {
          id: "ios",
          name: "iOS App Development",
          highlightText: "iOS app development services",
          title: "iOS App Development",
          description:
            "As a mobile application development company in Canada, we provide iOS app development services using Swift and SwiftUI, with a focus on performance, privacy, and smooth App Store approvals.",
          points: [
            {
              title: "System integration",
              text: "iOS builds are developed to connect with CRMs and ERPs. This helps Canadian businesses to keep processes linked instead of relying on disconnected tools.",
            },
            {
              title: "Scalable setup",
              text: "Modular codebases and CI/CD pipelines are built in from the start, making it easier for enterprises to handle rising traffic without constant rebuilds.",
            },
          ],
        },
        {
          id: "android",
          name: "Android App Development",
          highlightText: "Android app development services",
          title: "Android App Development",
          description:
            "We provide native Android app development services using Kotlin and Jetpack Compose, delivering fast, scalable, and secure Android applications tailored for the Canadian market.",
          points: [
            {
              title: "Hardware & OS optimization",
              text: "Android apps are fine-tuned for diverse hardware configurations, battery efficiency, and seamless background processing.",
            },
            {
              title: "Google Play compliance",
              text: "Strict adherence to Google Play Store security guidelines and Vitals benchmarks ensures high search visibility and seamless releases.",
            },
          ],
        },
        {
          id: "react-native",
          name: "React Native App Development",
          highlightText: "React Native app development",
          title: "React Native App Development",
          description:
            "We engineer high-performance cross-platform apps using React Native, giving your enterprise full native capabilities combined with modern React developer velocity.",
          points: [
            {
              title: "Native component architecture",
              text: "React Native bridges JavaScript logic directly to native iOS and Android components for zero compromise on speed or feel.",
            },
            {
              title: "Over-the-air updates",
              text: "Deploy immediate patch updates and feature enhancements directly to users without waiting for app store review cycles.",
            },
          ],
        },
        {
          id: "web-app",
          name: "Web App Development",
          highlightText: "mobile web app development",
          title: "Web App Development",
          description:
            "We build Progressive Web Applications (PWAs) and mobile-first web software that deliver native-like responsiveness, offline access, and fast loading speeds.",
          points: [
            {
              title: "Cross-browser accessibility",
              text: "Responsive web apps that run seamlessly across all mobile browsers without requiring store downloads.",
            },
            {
              title: "Offline capability",
              text: "Service workers and local storage allow users to access critical features even in low or no network environments.",
            },
          ],
        },
      ],
    },
    techStack: defaultTechStack,
  },

  "ui-ux-design": {
    uiuxEngagements: {
      eyebrow: "UI/UX Engagements",
      heading: "Four types of UI/UX engagements we run",
      items: [
        {
          title: "UX audit and recommendations",
          description:
            "An analysis of your current interface, identifying friction points and a report prioritized by impact on conversion. Delivered as a standalone engagement or built into a larger project.",
        },
        {
          title: "Wireframes and architecture",
          description:
            "Navigation structure, information hierarchy and functional mockups before the visual design. This step avoids costly revisions down the line.",
        },
        {
          title: "Interactive prototypes",
          description:
            "Clickable mockups and functional prototypes to validate the user experience before development. Quick tests and low-cost iterations.",
        },
        {
          title: "Full UI/UX design",
          description:
            "End-to-end design covering research, wireframes, visual UI, design systems, and handoff-ready assets. The complete package for a polished, pixel-perfect product.",
        },
      ],
    },
    techStack: defaultTechStack,
  },

  "ecommerce-solutions": {
    ecommerceServices: {
      eyebrow: "Our Services",
      heading: "End-to-End Ecommerce Development Services",
      description:
        "As a trusted ecommerce development company, we design, build, and optimize powerful online stores that drive revenue, improve user experience, and integrate seamlessly with your business systems.",
      items: [
        {
          num: "01",
          title: "Custom Storefront Development",
          desc: "Fully tailored custom ecommerce website development aligned with your brand and sales goals.",
        },
        {
          num: "02",
          title: "Platform-Agnostic Builds",
          desc: "Flexible ecommerce site development across Shopify, WooCommerce, Magento, and custom stacks.",
        },
        {
          num: "03",
          title: "UX & Conversion Design",
          desc: "High-impact ecommerce website design and development focused on usability and checkout flow.",
        },
        {
          num: "04",
          title: "Backend & API Integrations",
          desc: "Robust web ecommerce development with ERP, CRM, inventory, and payment integrations.",
        },
        {
          num: "05",
          title: "Scalable Architecture",
          desc: "Enterprise-ready ecommerce development services built for performance and growth.",
        },
        {
          num: "06",
          title: "Optimization & Support",
          desc: "Ongoing enhancements by experienced ecommerce developers and QA specialists.",
        },
      ],
    },
    techStack: defaultTechStack,
  },

  "seo-digital-marketing": {
    seoPackages: {
      eyebrow: "SEO Packages",
      heading: "Choose Your Growth Plan",
      description:
        "Transparent pricing with real deliverables. No hidden fees, no long-term contracts.",
      footerNote:
        "All packages include: Google Analytics setup, Search Console integration, and monthly performance reports.",
      customPackageText: "Need a custom package?",
      customPackageCtaLabel: "Contact us",
      packages: [
        {
          name: "Starter",
          blurb: "For small businesses getting started with SEO",
          price: "$799",
          priceSuffix: "/month",
          ctaLabel: "Get Started",
          features: [
            "Up to 10 keywords optimized",
            "Technical SEO audit & fixes",
            "On-page optimization",
            "2 blog posts/month",
            "Google Business Profile setup",
            "Monthly ranking report",
          ],
        },
        {
          name: "Growth",
          blurb: "For businesses ready to scale their online presence",
          price: "$1,499",
          priceSuffix: "/month",
          featured: true,
          featuredBadge: "MOST POPULAR",
          ctaLabel: "Get Started",
          features: [
            "Up to 25 keywords optimized",
            "Everything in Starter",
            "4 blog posts/month",
            "Link building (10 backlinks/month)",
            "Competitor analysis",
            "Local SEO optimization",
            "Bi-weekly strategy calls",
          ],
        },
        {
          name: "Enterprise",
          blurb: "For large businesses with aggressive growth goals",
          price: "$2,999",
          priceSuffix: "/month",
          ctaLabel: "Get Started",
          features: [
            "Unlimited keywords",
            "Everything in Growth",
            "8 blog posts/month",
            "Link building (25 backlinks/month)",
            "Google Ads management included",
            "Dedicated SEO manager",
            "Weekly strategy calls",
          ],
        },
      ],
    },
    localSeo: {
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
      citiesDescription:
        "We provide sophisticated local SEO services to businesses in every major Canadian city. Our targeted strategies help you dominate the Google Maps pack and rank for searches that actually convert.",
      cities: [
        "Toronto",
        "Brampton",
        "Mississauga",
        "North York",
        "Calgary",
        "Vancouver",
        "Ottawa",
        "Hamilton",
      ],
      ctaHeading: "Ready to Grow Your Organic Traffic?",
      ctaBody:
        "Every SEO engagement is scoped to your market, goals, and competition. Get a free strategy call and custom quote, no contracts, no lock-in.",
      ctaLabel: "Request a Free Quote",
    },
  },

  "cloud-solutions": {
    cloudIncluded: {
      heading: "Enterprise Cloud Deliverables",
      description:
        "Beyond basic cloud setup, we engineer production-ready cloud standards that guarantee uptime, security, and cost efficiency:",
      items: [
        {
          id: "auto-scaling",
          title: "High-Availability & Auto-Scaling",
          description:
            "Architecting zero-downtime, multi-region cloud infrastructures equipped with horizontal auto-scaling and intelligent load balancing to absorb traffic surges effortlessly.",
          points: [
            "Multi-AZ fault tolerance & load balancing",
            "Traffic-triggered horizontal auto-scaling",
            "99.99% Guaranteed SLA Uptime Target",
          ],
        },
        {
          id: "iac-automation",
          title: "IaC & CI/CD Release Automation",
          description:
            "Eliminating manual server management using Terraform, GitHub Actions, and containerization so code moves seamlessly from commit to production.",
          points: [
            "Terraform & CloudFormation state control",
            "Automated testing & deployment pipelines",
            "Instant environment duplication & rollbacks",
          ],
        },
        {
          id: "cyber-security",
          title: "Cyber Security & Regulatory Compliance",
          description:
            "Hardening cloud environments with zero-trust network policies, data encryption at rest and in transit, and continuous compliance audit readiness.",
          points: [
            "End-to-end KMS data encryption & IAM policies",
            "Automated WAF & DDoS threat protection",
            "SOC 2, ISO 27001 & HIPAA audit readiness",
          ],
        },
        {
          id: "finops-cost",
          title: "FinOps Spend & Cost Optimization",
          description:
            "Proactively managing monthly cloud bills through rightsizing idle compute nodes, savings plans, and automated resource cleanup triggers.",
          points: [
            "Savings Plans & Reserved Instance optimization",
            "Automated idle server shutdown triggers",
            "30-50% average cloud bill reduction",
          ],
        },
        {
          id: "observability",
          title: "24/7 Observability & Managed SLA",
          description:
            "Deep telemetry monitoring across metrics, logs, and APM traces to resolve latency bottlenecks before end users encounter any issues.",
          points: [
            "Real-time Prometheus & Grafana alerting",
            "Centralized log aggregation & tracing",
            "24/7 automated incident response SLAs",
          ],
        },
      ],
    },
    techStack: defaultTechStack,
  },

  "ai-ml-solutions": {
    aiMlGrid: {
      eyebrow: "Best AI/ML Services in Canada",
      heading: "Enterprise AI & ML Capabilities",
      intro: [
        "From intelligent chatbots to custom predictive algorithms, we deliver end-to-end AI capabilities that drive business growth. Our artificial intelligence and machine learning solutions empower organizations to unlock hidden data patterns, automate complex operational workflows, and enhance customer experiences across all touchpoints.",
        "By leveraging state-of-the-art neural networks, natural language processing, and advanced predictive analytics, we build resilient AI infrastructure tailored to your exact business objectives. Whether you are modernizing legacy operations or deploying next-generation Generative AI models, our engineering team ensures seamless scalability, robust enterprise security, and measurable ROI at every stage of development.",
      ],
      items: [
        {
          id: "chatbot",
          title: "Customer Service Automation",
          description:
            "Automate customer interactions using NLP and intelligent chatbots to reduce human workload, improve response times, and ensure 24/7 availability with consistent support experiences.",
        },
        {
          id: "analytics",
          title: "Data Analytics & Business Intelligence",
          description:
            "Unlock the value of your enterprise data with advanced analytics dashboards and visualization tools that reveal performance trends and uncover growth opportunities.",
        },
        {
          id: "process",
          title: "Process Automation & Optimization",
          description:
            "Streamline repetitive tasks and complex operational workflows using AI and ML automation to reduce manual costs, eliminate errors, and boost team output.",
        },
        {
          id: "strategy",
          title: "AI/ML Strategy & Consulting",
          description:
            "Design and implement tailored AI roadmaps aligned with business goals, focusing on high-ROI use cases, scalable architectures, and responsible AI innovation.",
        },
        {
          id: "predictive",
          title: "Predictive Analytics & Forecasting",
          description:
            "Forecast market demand, user churn, and inventory trends through custom machine learning models trained on historical data to drive proactive decision-making.",
        },
        {
          id: "llm",
          title: "Custom LLM & Generative AI Integration",
          description:
            "Fine-tune and integrate state-of-the-art Large Language Models (LLMs) and Generative AI into your applications for document processing, content generation, and smart search.",
        },
      ],
    },
    techStack: defaultTechStack,
  },

  "devops-cicd": {
    devopsGrid: {
      eyebrow: "Our Services",
      heading: "Our Comprehensive DevOps Services",
      description:
        "We provide end-to-end DevOps support, from initial assessment and strategy to implementation and ongoing management, helping you mature your software delivery lifecycle.",
      items: [
        {
          num: "01",
          title: "CI/CD Pipeline Automation",
          desc: "We design and build robust, automated CI/CD pipelines that enable you to test and deploy your code frequently and reliably with zero downtime.",
        },
        {
          num: "02",
          title: "Infrastructure as Code (IaC)",
          desc: "We use tools like Terraform and Ansible to manage your infrastructure as code, enabling versioning, repeatability, and scalability.",
        },
        {
          num: "03",
          title: "Cloud Automation & Management",
          desc: "We help you leverage the full power of the cloud (AWS, Azure, GCP) by automating resource provisioning, configuration, and management.",
        },
        {
          num: "04",
          title: "Monitoring & Observability",
          desc: "We implement comprehensive monitoring and observability solutions that give you deep visibility into your systems' health and performance.",
        },
        {
          num: "05",
          title: "DevSecOps & Security",
          desc: "We integrate security into every stage of your development lifecycle, from code scanning to compliance automation, to build more secure applications.",
        },
        {
          num: "06",
          title: "Site Reliability Engineering (SRE)",
          desc: "We apply SRE principles to improve your systems' reliability, performance, and resilience, ensuring you meet your service level objectives (SLOs).",
        },
      ],
    },
    techStack: defaultTechStack,
  },

  "web-development": {
    canadaCities: {
      heading: "Web Development Services Across Canada",
      description:
        "We serve businesses in every major Canadian city. Click your city to learn more about our local web development services.",
      cities: [
        "Toronto",
        "Vancouver",
        "Calgary",
        "Ottawa",
        "Mississauga",
        "Brampton",
        "Edmonton",
        "Hamilton",
      ],
    },
    engagementStrategies: defaultCityEngagementStrategies,
    techStack: defaultTechStack,
  },

  "custom-software-development": {
    techStack: defaultTechStack,
  },

  "maintenance-support": {
    techStack: defaultTechStack,
  },
};
