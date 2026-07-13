"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const services = [
  {
    slug: "web-development",
    title: "Web Development",
    description: "Enterprise-grade web applications that scale with your business and deliver exceptional user experiences.",
    icon: "code",
    features: ["Custom Web Apps", "Progressive Web Apps", "API Development", "Performance Optimization"]
  },
  {
    slug: "mobile-app-development",
    title: "Mobile App Development",
    description: "Native and cross-platform mobile solutions that engage users and drive business results.",
    icon: "mobile",
    features: ["iOS Development", "Android Development", "React Native", "Flutter"]
  },
  {
    slug: "cloud-solutions",
    title: "Cloud Solutions",
    description: "Scalable cloud infrastructure and migration services for optimal performance and cost efficiency.",
    icon: "cloud",
    features: ["AWS", "Azure", "Google Cloud", "Cloud Migration"]
  },
  {
    slug: "ai-ml-solutions",
    title: "AI/ML Solutions",
    description: "Intelligent systems that automate processes, predict outcomes, and drive innovation.",
    icon: "ai",
    features: ["Machine Learning", "NLP", "Computer Vision", "Predictive Analytics"]
  },
  {
    slug: "devops-cicd",
    title: "DevOps & CI/CD",
    description: "Streamlined development workflows with automated pipelines and infrastructure as code.",
    icon: "devops",
    features: ["CI/CD Pipelines", "Kubernetes", "Docker", "Infrastructure as Code"]
  },
  {
    slug: "ui-ux-design",
    title: "UI/UX Design",
    description: "Human-centered design that creates intuitive, engaging digital experiences.",
    icon: "design",
    features: ["User Research", "UX Strategy", "Visual Design", "Prototyping"]
  },
  {
    slug: "ecommerce-solutions",
    title: "E-commerce Solutions",
    description: "High-converting online stores that scale with your business and delight customers.",
    icon: "ecommerce",
    features: ["Custom Platforms", "Shopify", "WooCommerce", "Payment Integration"]
  },
  {
    slug: "custom-software-development",
    title: "Custom Software Development",
    description: "Bespoke enterprise solutions tailored to your unique business processes.",
    icon: "custom",
    features: ["Enterprise Apps", "System Integration", "Legacy Modernization", "SaaS Development"]
  },
  {
    slug: "seo-digital-marketing",
    title: "SEO/Digital Marketing",
    description: "Data-driven strategies to maximize online visibility and drive qualified traffic.",
    icon: "marketing",
    features: ["Technical SEO", "Content Strategy", "PPC Campaigns", "Analytics"]
  },
  {
    slug: "maintenance-support",
    title: "Maintenance & Support",
    description: "24/7 technical support and proactive maintenance to keep your applications running smoothly.",
    icon: "support",
    features: ["24/7 Monitoring", "Security Updates", "Performance Tuning", "Dedicated Support"]
  }
];

const ServiceIcon = ({ type }: { type: string }) => {
  const icons: { [key: string]: JSX.Element } = {
    code: <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />,
    mobile: <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />,
    cloud: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />,
    ai: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />,
    devops: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </>
    ),
    design: <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />,
    ecommerce: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />,
    custom: <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />,
    marketing: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />,
    support: <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
  };

  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      {icons[type] || icons.code}
    </svg>
  );
};

export default function ServicesPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [list, setList] = useState(services);

  useEffect(() => {
    setIsVisible(true);

    fetch("/api/cms/services")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const cmsServices = data?.services as
          | {
              slug?: string;
              title?: string;
              description?: string;
              features?: { title?: string }[] | string[];
            }[]
          | undefined;
        if (!cmsServices?.length) return;

        setList(
          cmsServices.map((s) => {
            const fallback = services.find((d) => d.slug === s.slug);
            const features = Array.isArray(s.features)
              ? s.features
                  .map((f) => (typeof f === "string" ? f : String(f?.title || "")))
                  .filter(Boolean)
              : fallback?.features || [];

            return {
              slug: String(s.slug || fallback?.slug || ""),
              title: String(s.title || fallback?.title || ""),
              description: String(s.description || fallback?.description || ""),
              icon: fallback?.icon || "code",
              features: features.length ? features : fallback?.features || [],
            };
          })
        );
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
        
        {/* Animated Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#00B4FF]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00B4FF]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#0055FF]/10 rounded-full blur-3xl" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 pt-32 pb-20 text-center">
          <div className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-white/60 text-sm mb-8">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span className="bg-gradient-to-r from-[#0055FF] via-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">Services</span>
            </div>

            <span className="inline-block px-4 py-2 bg-[#00B4FF]/20 border border-[#00B4FF]/30 rounded-full text-[#00E1FF] text-sm font-medium mb-6">
              Our Expertise
            </span>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              What We <span className="bg-gradient-to-r from-[#0055FF] via-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">Do</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto">
              Comprehensive technology services designed to transform your business. 
              From strategy to execution, we deliver solutions that drive growth.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {list.map((service, index) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className={`group relative p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:border-[#00B4FF]/30 transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Icon */}
                <div className="w-16 h-16 bg-[#00B4FF]/10 rounded-xl flex items-center justify-center text-[#00B4FF] mb-6 group-hover:bg-gradient-to-r group-hover:from-[#0055FF] group-hover:via-[#00B4FF] group-hover:to-[#00E1FF] group-hover:text-white transition-all duration-300">
                  <ServiceIcon type={service.icon} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-[#1a1a2e] mb-3 group-hover:text-[#00B4FF] transition-colors">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-6 line-clamp-2">
                  {service.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {service.features.slice(0, 3).map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[#00B4FF]/10 text-[#0055FF] text-xs rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Arrow */}
                <div className="flex items-center gap-2 text-[#00B4FF] font-medium">
                  <span>Learn More</span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-300 ${hoveredIndex === index ? "translate-x-2" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>

                {/* Hover Gradient */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00B4FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 md:py-28 bg-[#f8f9fa]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-[#00B4FF]/10 rounded-full text-[#00B4FF] text-sm font-medium mb-4">
                Why Choose Us
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a2e] mb-6">
                Your Success Is Our <span className="bg-gradient-to-r from-[#0055FF] via-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">Priority</span>
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                We don&apos;t just build technology—we build partnerships. Our team of experts works closely with you to understand your challenges and deliver solutions that exceed expectations.
              </p>
              
              <div className="space-y-6">
                {[
                  { title: "Expert Team", description: "500+ certified professionals across all technology domains" },
                  { title: "Proven Track Record", description: "1000+ successful projects delivered globally" },
                  { title: "Agile Approach", description: "Flexible methodologies adapted to your needs" },
                  { title: "24/7 Support", description: "Round-the-clock assistance for your peace of mind" }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-[#0055FF] to-[#00B4FF] flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1a1a2e]">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { value: "15+", label: "Years Experience" },
                { value: "1000+", label: "Projects Delivered" },
                { value: "500+", label: "Expert Team" },
                { value: "98%", label: "Client Satisfaction" }
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-lg text-center"
                >
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#0055FF] via-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your <span className="bg-gradient-to-r from-[#0055FF] via-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">Business</span>?
            </h2>
            <p className="text-white/70 text-lg mb-10">
              Let&apos;s discuss how our services can help you achieve your goals and drive real results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/#get-in-touch"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0055FF] via-[#00B4FF] to-[#00E1FF] hover:opacity-90 text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#00B4FF]/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Get in Touch
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 border border-white/30 hover:border-white/50 text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 hover:bg-white/5"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
}
