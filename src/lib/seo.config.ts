import { Metadata } from "next";

const siteUrl = "https://vyntechsolutions.ca";

export const defaultSEO: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VynTech Solutions | Building Digital Excellence for Canadian Businesses",
    template: "%s | VynTech Solutions - Canadian Digital Agency",
  },
  description:
    "VynTech Solutions is Canada's leading digital agency specializing in custom web development, mobile apps, UI/UX design, and enterprise software solutions. Serving businesses across Toronto, Vancouver, Montreal & nationwide.",
  keywords: [
    // Primary Keywords - Canada Focus
    "web development Canada",
    "web development company Canada",
    "best web development agency Canada",
    "top software development company Toronto",
    "mobile app development Vancouver",
    "custom software development Montreal",
    // Service Keywords
    "UI/UX design agency Canada",
    "enterprise software solutions",
    "digital transformation Canada",
    "ecommerce development Canada",
    "React Next.js development",
    "full stack development services",
    "cloud solutions AWS Azure",
    "AI ML development Canada",
    "DevOps CI/CD services",
    // Industry Keywords
    "fintech software development",
    "healthcare software Canada",
    "retail ecommerce solutions",
    "startup MVP development",
    "SaaS development company",
    // Location Keywords
    "web developers Toronto",
    "software company Vancouver",
    "tech agency Montreal",
    "digital agency Ontario",
    "IT services British Columbia",
    "web design Calgary",
    "app developers Edmonton",
    "software development Ottawa",
    // Long-tail Keywords
    "hire dedicated developers Canada",
    "outsource web development Canada",
    "affordable web development Toronto",
    "professional website design Vancouver",
    "custom CRM development Canada",
    "enterprise web application development",
    "progressive web app development",
    "cross platform mobile app development",
  ],
  authors: [{ name: "VynTech Solutions", url: siteUrl }],
  creator: "VynTech Solutions",
  publisher: "VynTech Solutions",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      "en-CA": siteUrl,
      "fr-CA": `${siteUrl}/fr`,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: siteUrl,
    siteName: "VynTech Solutions",
    title: "VynTech Solutions | Building Digital Excellence for Canadian Businesses",
    description:
      "Transform your business with Canada's leading digital agency. Custom web development, mobile apps, and enterprise solutions tailored for Canadian businesses.",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "VynTech Solutions - Canadian Digital Agency",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VynTech Solutions | Canada's Leading Digital Agency",
    description:
      "Custom web development, mobile apps & enterprise solutions for Canadian businesses. Toronto, Vancouver, Montreal & nationwide.",
    images: [`${siteUrl}/og-image.png`],
    creator: "@vyntechsolutions",
    site: "@vyntechsolutions",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png" }],
    other: [{ rel: "manifest", url: "/favicon/site.webmanifest" }],
  },
  verification: {
    google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  category: "technology",
};

// Structured Data - Organization
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VynTech Solutions",
  alternateName: "VynTech Solutions",
  url: siteUrl,
  logo: `${siteUrl}/favicon/android-chrome-512x512.png`,
  description:
    "Canada's premier digital agency specializing in web development, mobile apps, and enterprise software solutions.",
  foundingDate: "2020",
  founders: [
    {
      "@type": "Person",
      name: "VynTech Solutions Team",
    },
  ],
  address: {
    "@type": "PostalAddress",
    addressCountry: "CA",
    addressRegion: "ON",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+1-XXX-XXX-XXXX",
      contactType: "customer service",
      email: "info@vyntechsolutions.ca",
      areaServed: "CA",
      availableLanguage: ["English", "French"],
    },
  ],
  sameAs: [
    "https://www.linkedin.com/company/vyntechsolutions",
    "https://twitter.com/vyntechsolutions",
    "https://www.instagram.com/vyntechsolutions",
    "https://github.com/vyntechsolutions",
  ],
  areaServed: {
    "@type": "Country",
    name: "Canada",
  },
  serviceArea: {
    "@type": "GeoCircle",
    geoMidpoint: {
      "@type": "GeoCoordinates",
      latitude: 43.6532,
      longitude: -79.3832,
    },
    geoRadius: "5000",
  },
};

// Structured Data - LocalBusiness
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "VynTech Solutions",
  image: `${siteUrl}/favicon/android-chrome-512x512.png`,
  url: siteUrl,
  telephone: "+1-XXX-XXX-XXXX",
  email: "info@vyntechsolutions.ca",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    addressCountry: "CA",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 43.6532,
    longitude: -79.3832,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "127",
  },
};

// Structured Data - WebSite with SearchAction
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "VynTech Solutions",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

// Services Schema
export const servicesSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    {
      "@type": "Service",
      position: 1,
      name: "Custom Web Development",
      description:
        "Enterprise-grade web applications built with React, Next.js, and modern technologies for Canadian businesses.",
      provider: { "@type": "Organization", name: "VynTech Solutions" },
      areaServed: "Canada",
    },
    {
      "@type": "Service",
      position: 2,
      name: "Mobile App Development",
      description:
        "Native and cross-platform mobile applications for iOS and Android, designed for the Canadian market.",
      provider: { "@type": "Organization", name: "VynTech Solutions" },
      areaServed: "Canada",
    },
    {
      "@type": "Service",
      position: 3,
      name: "UI/UX Design",
      description:
        "User-centered design solutions that enhance engagement and conversion for Canadian enterprises.",
      provider: { "@type": "Organization", name: "VynTech Solutions" },
      areaServed: "Canada",
    },
    {
      "@type": "Service",
      position: 4,
      name: "Enterprise Software Solutions",
      description:
        "Scalable enterprise applications and digital transformation services for businesses across Canada.",
      provider: { "@type": "Organization", name: "VynTech Solutions" },
      areaServed: "Canada",
    },
    {
      "@type": "Service",
      position: 5,
      name: "E-commerce Development",
      description:
        "Custom e-commerce platforms and Shopify solutions optimized for the Canadian retail market.",
      provider: { "@type": "Organization", name: "VynTech Solutions" },
      areaServed: "Canada",
    },
  ],
};

// FAQ Schema for Homepage (Google Rich Results)
export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What services does VynTech Solutions offer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "VynTech Solutions offers comprehensive digital services including custom web development, mobile app development (iOS & Android), UI/UX design, cloud solutions, AI/ML development, e-commerce solutions, and enterprise software development. We serve businesses across Canada including Toronto, Vancouver, and Montreal.",
      },
    },
    {
      "@type": "Question",
      name: "How much does web development cost in Canada?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Web development costs vary based on project complexity. Simple websites start from $5,000 CAD, while custom web applications range from $15,000 to $100,000+ CAD. Contact VynTech Solutions for a free consultation and accurate quote for your specific requirements.",
      },
    },
    {
      "@type": "Question",
      name: "How long does it take to build a website?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Timeline depends on project scope. A simple website takes 2-4 weeks, while complex web applications may take 3-6 months. We follow agile methodologies with regular updates and transparent communication throughout the development process.",
      },
    },
    {
      "@type": "Question",
      name: "Do you work with startups and enterprises?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! VynTech Solutions works with businesses of all sizes - from early-stage startups launching their first MVP to established enterprises modernizing their digital infrastructure. We tailor our approach to match your business needs and budget.",
      },
    },
    {
      "@type": "Question",
      name: "What technologies do you use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We use modern, scalable technologies including React, Next.js, Node.js, Python, TypeScript, PostgreSQL, MongoDB, AWS, Azure, Google Cloud, React Native, Flutter, and more. We choose the best tech stack based on your project requirements.",
      },
    },
  ],
};

// Breadcrumb Schema Generator
export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

// Software Application Schema (for showcasing expertise)
export const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "VynTech Solutions",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, iOS, Android",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "CAD",
    description: "Free consultation for custom software development",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "127",
    bestRating: "5",
    worstRating: "1",
  },
  provider: {
    "@type": "Organization",
    name: "VynTech Solutions",
    url: siteUrl,
  },
};

// Review Schema
export const reviewSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VynTech Solutions",
  url: siteUrl,
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    bestRating: "5",
    worstRating: "1",
    ratingCount: "127",
  },
  review: [
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Canadian Startup Founder" },
      datePublished: "2024-01-15",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody: "VynTech Solutions delivered our MVP on time and within budget. Excellent team to work with!",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Toronto Enterprise Client" },
      datePublished: "2024-02-20",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody: "Professional, responsive, and technically excellent. Highly recommend for enterprise projects.",
    },
  ],
};

// How-To Schema (for service pages)
export const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Start Your Web Development Project with VynTech Solutions",
  description: "Simple steps to begin your digital transformation journey with Canada's leading web agency.",
  step: [
    {
      "@type": "HowToStep",
      name: "Free Consultation",
      text: "Schedule a free consultation to discuss your project requirements and goals.",
      url: `${siteUrl}/lets-talk-business`,
    },
    {
      "@type": "HowToStep",
      name: "Project Planning",
      text: "We create a detailed project plan with timeline, milestones, and budget.",
    },
    {
      "@type": "HowToStep",
      name: "Development",
      text: "Our expert team builds your solution with regular updates and demos.",
    },
    {
      "@type": "HowToStep",
      name: "Launch & Support",
      text: "We deploy your project and provide ongoing support and maintenance.",
    },
  ],
};

// Page-specific SEO configurations
export const pageSEO = {
  home: {
    title: "VynTech Solutions | Building Digital Excellence for Canadian Businesses",
    description:
      "Transform your business with Canada's leading digital agency. Custom web development, mobile apps, UI/UX design & enterprise solutions. Serving Toronto, Vancouver, Montreal & nationwide.",
  },
  about: {
    title: "About Us - Our Story & Mission",
    description:
      "Discover VynTech Solutions - Canada's trusted digital partner since 2020. Learn about our team, values, and commitment to delivering exceptional web solutions for Canadian businesses.",
  },
  services: {
    title: "Our Services - Web Development, Mobile Apps & More",
    description:
      "Explore our comprehensive digital services: custom web development, mobile app development, UI/UX design, cloud solutions, and enterprise software. Tailored for Canadian businesses.",
  },
  careers: {
    title: "Careers - Join Our Team",
    description:
      "Join Canada's fastest-growing digital agency. Explore exciting career opportunities in web development, design, and technology at VynTech Solutions.",
  },
  blog: {
    title: "Blog - Insights & Industry Trends",
    description:
      "Stay updated with the latest in web development, digital trends, and technology insights from VynTech Solutions' expert team in Canada.",
  },
  industries: {
    title: "Industries We Serve",
    description:
      "Specialized digital solutions for healthcare, fintech, retail, real estate, and more. Industry-specific expertise for Canadian businesses.",
  },
  contact: {
    title: "Contact Us - Let's Build Together",
    description:
      "Ready to transform your digital presence? Contact VynTech Solutions for a free consultation. Serving businesses across Canada with tailored web solutions.",
  },
};
