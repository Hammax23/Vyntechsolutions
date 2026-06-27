"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";

const GoogleRankingPromo = dynamic(() => import("@/components/GoogleRankingPromo"), {
  ssr: false,
  loading: () => (
    <div className="w-[248px] xl:w-[268px] h-[168px] rounded-xl bg-white/80 border border-white/90 animate-pulse" aria-hidden />
  ),
});

// Tech stack logos
const techStacks = [
  { id: 1, name: "React", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { id: 2, name: "Next.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
  { id: 3, name: "Vue.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg" },
  { id: 4, name: "Angular", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg" },
  { id: 5, name: "TypeScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
  { id: 6, name: "Node.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
  { id: 7, name: "Python", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
  { id: 8, name: "Java", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
  { id: 9, name: "AWS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg" },
  { id: 10, name: "Azure", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg" },
  { id: 11, name: "Google Cloud", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg" },
  { id: 12, name: "Docker", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
  { id: 13, name: "MongoDB", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
  { id: 14, name: "PostgreSQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
  { id: 15, name: "Kubernetes", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg" },
  { id: 16, name: "Git", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
  { id: 17, name: "GraphQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg" },
  { id: 18, name: "Figma", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
  { id: 19, name: "TailwindCSS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
  { id: 20, name: "Flutter", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg" },
];

// SVG Icons for services
const ServiceIcons = {
  web: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  mobile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  ),
  cloud: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
    </svg>
  ),
  ai: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
  devops: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L6.75 2.906m9.944 18.08l-1.15-.964M5.106 6.214l-1.15-.964m17.99 5.13l-1.41-.513M5.954 15.436l-1.41-.514" />
    </svg>
  ),
  uiux: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
    </svg>
  ),
  ecommerce: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  ),
  custom: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  ),
  seo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  support: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
  ),
};

const serviceCards = [
  {
    title: "Web Development",
    description: "Modern, responsive websites built with cutting-edge technologies for optimal performance.",
    href: "/services/web-development",
    icon: "web",
    gradient: "from-blue-500 to-indigo-600",
    lightGradient: "from-blue-50 to-indigo-50",
  },
  {
    title: "Mobile App Development",
    description: "Native & cross-platform mobile applications for iOS and Android platforms.",
    href: "/services/mobile-app-development",
    icon: "mobile",
    gradient: "from-purple-500 to-pink-600",
    lightGradient: "from-purple-50 to-pink-50",
  },
  {
    title: "Cloud Solutions",
    description: "Scalable cloud infrastructure on AWS, Azure & GCP for enterprise workloads.",
    href: "/services/cloud-solutions",
    icon: "cloud",
    gradient: "from-cyan-500 to-blue-600",
    lightGradient: "from-cyan-50 to-blue-50",
  },
  {
    title: "AI/ML Solutions",
    description: "Intelligent automation & machine learning models to transform your business.",
    href: "/services/ai-ml-solutions",
    icon: "ai",
    gradient: "from-violet-500 to-purple-600",
    lightGradient: "from-violet-50 to-purple-50",
  },
  {
    title: "DevOps & CI/CD",
    description: "Streamlined deployment pipelines and infrastructure automation at scale.",
    href: "/services/devops-cicd",
    icon: "devops",
    gradient: "from-orange-500 to-red-600",
    lightGradient: "from-orange-50 to-red-50",
  },
  {
    title: "UI/UX Design",
    description: "User-centered design that creates engaging digital experiences.",
    href: "/services/ui-ux-design",
    icon: "uiux",
    gradient: "from-pink-500 to-rose-600",
    lightGradient: "from-pink-50 to-rose-50",
  },
  {
    title: "E-commerce Solutions",
    description: "End-to-end online store development with secure payment integrations.",
    href: "/services/ecommerce-solutions",
    icon: "ecommerce",
    gradient: "from-emerald-500 to-teal-600",
    lightGradient: "from-emerald-50 to-teal-50",
  },
  {
    title: "Custom Software",
    description: "Bespoke software solutions tailored to your unique business requirements.",
    href: "/services/custom-software-development",
    icon: "custom",
    gradient: "from-slate-600 to-gray-700",
    lightGradient: "from-slate-50 to-gray-100",
  },
  {
    title: "SEO & Digital Marketing",
    description: "Data-driven strategies to boost visibility and drive qualified leads.",
    href: "/services/seo-digital-marketing",
    icon: "seo",
    gradient: "from-amber-500 to-orange-600",
    lightGradient: "from-amber-50 to-orange-50",
  },
  {
    title: "Maintenance & Support",
    description: "24/7 technical support and proactive maintenance for your systems.",
    href: "/services/maintenance-support",
    icon: "support",
    gradient: "from-teal-500 to-cyan-600",
    lightGradient: "from-teal-50 to-cyan-50",
  },
];

export default function OurServices() {
  const [isVisible, setIsVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const techScrollRef = useRef<HTMLDivElement>(null);

  // Duplicate logos for infinite scroll
  const duplicatedStacks = [...techStacks, ...techStacks];

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      });
    }, observerOptions);

    const cardsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCardsVisible(true);
        }
      });
    }, { threshold: 0.1 });

    if (sectionRef.current) sectionObserver.observe(sectionRef.current);
    if (cardsRef.current) cardsObserver.observe(cardsRef.current);

    return () => {
      sectionObserver.disconnect();
      cardsObserver.disconnect();
    };
  }, []);

  // Auto-scroll effect for tech stack
  useEffect(() => {
    if (!isVisible) return;

    const scrollContainer = techScrollRef.current;
    if (!scrollContainer) return;

    let scrollPosition = 0;
    const scrollSpeed = 1;
    
    const animate = () => {
      scrollPosition += scrollSpeed;
      const halfWidth = scrollContainer.scrollWidth / 2;
      if (scrollPosition >= halfWidth) {
        scrollPosition = 0;
      }
      scrollContainer.scrollLeft = scrollPosition;
    };

    const interval = setInterval(animate, 30);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section 
      ref={sectionRef}
      className={`w-full bg-gradient-to-br from-[#e8f4f8] via-[#f0f0f0] to-[#e8f0f4] py-16 sm:py-20 md:py-24 lg:py-28 transition-all duration-1000 overflow-hidden ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
        {/* Header: title + subheading stacked tight; SEO card in right column */}
        <div
          className={`text-center mb-12 sm:mb-14 md:mb-16 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {/* Desktop XL */}
          <div className="hidden xl:grid xl:grid-cols-[1fr_auto_1fr] xl:gap-x-6 xl:items-start">
            <div aria-hidden />
            <div className="px-2">
              <h2
                className={`text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] font-light leading-tight tracking-tight transition-opacity duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}
                style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}
              >
                <span className="bg-gradient-to-tr from-[#00E1FF] via-[#0055FF] to-[#FF6B6B] text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(0,180,255,0.2)]">O</span>
                <span className="text-[#1a1a2e]">ur</span>
                <span className="text-[#1a1a2e]">&nbsp;</span>
                <span className="bg-gradient-to-tr from-[#00E1FF] via-[#0055FF] to-[#FF6B6B] text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(0,180,255,0.2)]">S</span>
                <span className="text-[#1a1a2e]">ervic</span>
                <span className="bg-gradient-to-tr from-[#0055FF] via-[#FF6B6B] to-[#FF4757] text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(255,107,107,0.2)]">e</span>
                <span className="text-[#1a1a2e]">s</span>
              </h2>
              <h3 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl md:text-3xl font-light text-[#1a1a2e]" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
                Transforming Modern Businesses
              </h3>
              <p className="mt-2 sm:mt-2.5 text-base sm:text-lg md:text-xl text-gray-600" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
                Through{" "}
                <span className="font-medium" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Innovation</span>
                ,{" "}
                <span className="font-medium" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Technology</span>
                , and{" "}
                <span className="font-medium" style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Scalable Digital Solutions</span>
              </p>
            </div>
            <div className={`flex justify-end items-start transition-all duration-700 delay-150 ${isVisible ? "opacity-100" : "opacity-0"}`}>
              <GoogleRankingPromo />
            </div>
          </div>

          {/* Desktop LG */}
          <div className="hidden lg:block xl:hidden">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-x-4 items-start">
              <div aria-hidden />
              <div>
                <h2 className={`text-3xl md:text-5xl lg:text-[3.5rem] font-light leading-tight tracking-tight ${isVisible ? "opacity-100" : "opacity-0"}`} style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
                  <span className="bg-gradient-to-tr from-[#00E1FF] via-[#0055FF] to-[#FF6B6B] text-transparent bg-clip-text">O</span>
                  <span className="text-[#1a1a2e]">ur</span>
                  <span className="text-[#1a1a2e]">&nbsp;</span>
                  <span className="bg-gradient-to-tr from-[#00E1FF] via-[#0055FF] to-[#FF6B6B] text-transparent bg-clip-text">S</span>
                  <span className="text-[#1a1a2e]">ervic</span>
                  <span className="bg-gradient-to-tr from-[#0055FF] via-[#FF6B6B] to-[#FF4757] text-transparent bg-clip-text">e</span>
                  <span className="text-[#1a1a2e]">s</span>
                </h2>
                <h3 className="mt-1.5 text-2xl md:text-3xl font-light text-[#1a1a2e]" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>Transforming Modern Businesses</h3>
                <p className="mt-2 text-base sm:text-lg text-gray-600" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
                  Through{" "}
                  <span className="font-medium" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Innovation</span>
                  ,{" "}
                  <span className="font-medium" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Technology</span>
                  , and{" "}
                  <span className="font-medium" style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Scalable Digital Solutions</span>
                </p>
              </div>
              <div className={`flex justify-end ${isVisible ? "opacity-100" : "opacity-0"}`}>
                <GoogleRankingPromo />
              </div>
            </div>
          </div>

          {/* Mobile & tablet */}
          <div className="lg:hidden">
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-light leading-tight tracking-tight ${isVisible ? "opacity-100" : "opacity-0"}`} style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
              <span className="bg-gradient-to-tr from-[#00E1FF] via-[#0055FF] to-[#FF6B6B] text-transparent bg-clip-text">O</span>
              <span className="text-[#1a1a2e]">ur</span>
              <span className="text-[#1a1a2e]">&nbsp;</span>
              <span className="bg-gradient-to-tr from-[#00E1FF] via-[#0055FF] to-[#FF6B6B] text-transparent bg-clip-text">S</span>
              <span className="text-[#1a1a2e]">ervic</span>
              <span className="bg-gradient-to-tr from-[#0055FF] via-[#FF6B6B] to-[#FF4757] text-transparent bg-clip-text">e</span>
              <span className="text-[#1a1a2e]">s</span>
            </h2>
            <h3 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-light text-[#1a1a2e]" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>Transforming Modern Businesses</h3>
            <p className="mt-2 text-base sm:text-lg text-gray-600" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
              Through{" "}
              <span className="font-medium" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Innovation</span>
              ,{" "}
              <span className="font-medium" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Technology</span>
              , and{" "}
              <span className="font-medium" style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Scalable Digital Solutions</span>
            </p>
            <div className={`flex justify-center mt-5 ${isVisible ? "opacity-100" : "opacity-0"}`}>
              <GoogleRankingPromo compact />
            </div>
          </div>
        </div>

        {/* Enterprise Service Cards - Modern Grid */}
        <div 
          ref={cardsRef}
          className={`transition-all duration-1000 delay-300 ${
            cardsVisible 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-8"
          }`}
        >
          {/* Grid - 5 columns on desktop, responsive on smaller screens */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
            {serviceCards.map((card, index) => (
              <Link
                key={index}
                href={card.href}
                className="group relative"
                style={{
                  animationDelay: `${index * 80}ms`
                }}
              >
                {/* Card Container */}
                <div className="relative h-full bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                  {/* Gradient accent line at top */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
                  
                  {/* Background gradient on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.lightGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${card.gradient} p-3 text-white mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                      {ServiceIcons[card.icon as keyof typeof ServiceIcons]}
                    </div>
                    
                    {/* Title */}
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors leading-tight">
                      {card.title}
                    </h4>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 group-hover:text-gray-600 transition-colors">
                      {card.description}
                    </p>
                    
                    {/* Arrow indicator */}
                    <div className="mt-4 flex items-center text-sm font-medium">
                      <span className={`bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0`}>
                        Learn more
                      </span>
                      <svg 
                        className={`w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-4 group-hover:translate-x-0`}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="url(#arrow-gradient)"
                        strokeWidth="2"
                      >
                        <defs>
                          <linearGradient id="arrow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#8B5CF6" />
                          </linearGradient>
                        </defs>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Tech Stack Carousel */}
        <div className="mt-10 sm:mt-12 md:mt-14 lg:mt-16">
          <div 
            className={`relative transition-all duration-700 delay-500 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Gradient Overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 md:w-32 bg-gradient-to-r from-[#e8f4f8] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 md:w-32 bg-gradient-to-l from-[#e8f4f8] to-transparent z-10 pointer-events-none" />

            {/* Scrolling Container */}
            <div
              ref={techScrollRef}
              className="flex gap-12 sm:gap-16 md:gap-20 overflow-x-hidden pt-2"
            >
              {duplicatedStacks.map((tech, index) => (
                <div
                  key={`${tech.id}-${index}`}
                  className="flex-shrink-0"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 relative flex items-center justify-center">
                      <Image
                        src={tech.logo}
                        alt={tech.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-contain"
                        unoptimized
                      />
                    </div>
                    <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
                      {tech.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
