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

const serviceCards = [
  {
    title: "Web Development",
    href: "/services/web-development",
    image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=400&fit=crop",
    gradient: "from-blue-500/30 to-indigo-600/30",
  },
  {
    title: "Mobile App Development",
    href: "/services/mobile-app-development",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop",
    gradient: "from-purple-500/30 to-indigo-600/30",
  },
  {
    title: "Cloud Solutions",
    href: "/services/cloud-solutions",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop",
    gradient: "from-cyan-500/30 to-blue-600/30",
  },
  {
    title: "AI/ML Solutions",
    href: "/services/ai-ml-solutions",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&h=400&fit=crop",
    gradient: "from-violet-500/30 to-purple-600/30",
  },
  {
    title: "DevOps & CI/CD",
    href: "/services/devops-cicd",
    image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&h=400&fit=crop",
    gradient: "from-orange-500/30 to-red-600/30",
  },
  {
    title: "UI/UX Design",
    href: "/services/ui-ux-design",
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&h=400&fit=crop",
    gradient: "from-pink-500/30 to-rose-600/30",
  },
  {
    title: "E-commerce Solutions",
    href: "/services/ecommerce-solutions",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop",
    gradient: "from-emerald-500/30 to-teal-600/30",
  },
  {
    title: "Custom Software",
    href: "/services/custom-software-development",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop",
    gradient: "from-slate-500/30 to-gray-600/30",
  },
  {
    title: "SEO/Digital Marketing",
    href: "/services/seo-digital-marketing",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    gradient: "from-amber-500/30 to-orange-600/30",
  },
  {
    title: "Maintenance & Support",
    href: "/services/maintenance-support",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
    gradient: "from-teal-500/30 to-cyan-600/30",
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
                className={`text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] font-bold leading-tight tracking-tight transition-opacity duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}
              >
                <span className="bg-gradient-to-tr from-[#00E1FF] via-[#0055FF] to-[#FF6B6B] text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(0,180,255,0.2)]">O</span>
                <span className="text-[#1a1a2e]">ur</span>
                <span className="text-[#1a1a2e]">&nbsp;</span>
                <span className="bg-gradient-to-tr from-[#00E1FF] via-[#0055FF] to-[#FF6B6B] text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(0,180,255,0.2)]">S</span>
                <span className="text-[#1a1a2e]">ervic</span>
                <span className="bg-gradient-to-tr from-[#0055FF] via-[#FF6B6B] to-[#FF4757] text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(255,107,107,0.2)]">e</span>
                <span className="text-[#1a1a2e]">s</span>
              </h2>
              <h3 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl md:text-3xl font-bold text-[#1a1a2e]">
                Transforming Modern Businesses
              </h3>
              <p className="mt-2 sm:mt-2.5 text-base sm:text-lg md:text-xl text-gray-600">
                Through{" "}
                <span className="font-semibold" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Innovation</span>
                ,{" "}
                <span className="font-semibold" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Technology</span>
                , and{" "}
                <span className="font-semibold" style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Scalable Digital Solutions</span>
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
                <h2 className={`text-3xl md:text-5xl lg:text-[3.5rem] font-bold leading-tight tracking-tight ${isVisible ? "opacity-100" : "opacity-0"}`}>
                  <span className="bg-gradient-to-tr from-[#00E1FF] via-[#0055FF] to-[#FF6B6B] text-transparent bg-clip-text">O</span>
                  <span className="text-[#1a1a2e]">ur</span>
                  <span className="text-[#1a1a2e]">&nbsp;</span>
                  <span className="bg-gradient-to-tr from-[#00E1FF] via-[#0055FF] to-[#FF6B6B] text-transparent bg-clip-text">S</span>
                  <span className="text-[#1a1a2e]">ervic</span>
                  <span className="bg-gradient-to-tr from-[#0055FF] via-[#FF6B6B] to-[#FF4757] text-transparent bg-clip-text">e</span>
                  <span className="text-[#1a1a2e]">s</span>
                </h2>
                <h3 className="mt-1.5 text-2xl md:text-3xl font-bold text-[#1a1a2e]">Transforming Modern Businesses</h3>
                <p className="mt-2 text-base sm:text-lg text-gray-600">
                  Through{" "}
                  <span className="font-semibold" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Innovation</span>
                  ,{" "}
                  <span className="font-semibold" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Technology</span>
                  , and{" "}
                  <span className="font-semibold" style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Scalable Digital Solutions</span>
                </p>
              </div>
              <div className={`flex justify-end ${isVisible ? "opacity-100" : "opacity-0"}`}>
                <GoogleRankingPromo />
              </div>
            </div>
          </div>

          {/* Mobile & tablet */}
          <div className="lg:hidden">
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight ${isVisible ? "opacity-100" : "opacity-0"}`}>
              <span className="bg-gradient-to-tr from-[#00E1FF] via-[#0055FF] to-[#FF6B6B] text-transparent bg-clip-text">O</span>
              <span className="text-[#1a1a2e]">ur</span>
              <span className="text-[#1a1a2e]">&nbsp;</span>
              <span className="bg-gradient-to-tr from-[#00E1FF] via-[#0055FF] to-[#FF6B6B] text-transparent bg-clip-text">S</span>
              <span className="text-[#1a1a2e]">ervic</span>
              <span className="bg-gradient-to-tr from-[#0055FF] via-[#FF6B6B] to-[#FF4757] text-transparent bg-clip-text">e</span>
              <span className="text-[#1a1a2e]">s</span>
            </h2>
            <h3 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold text-[#1a1a2e]">Transforming Modern Businesses</h3>
            <p className="mt-2 text-base sm:text-lg text-gray-600">
              Through{" "}
              <span className="font-semibold" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Innovation</span>
              ,{" "}
              <span className="font-semibold" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Technology</span>
              , and{" "}
              <span className="font-semibold" style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Scalable Digital Solutions</span>
            </p>
            <div className={`flex justify-center mt-5 ${isVisible ? "opacity-100" : "opacity-0"}`}>
              <GoogleRankingPromo compact />
            </div>
          </div>
        </div>

        {/* All Service Cards - 2 rows x 5 columns */}
        <div 
          ref={cardsRef}
          className={`transition-all duration-1000 delay-300 ${
            cardsVisible 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-8"
          }`}
        >
          {/* Grid - 5 columns on desktop, 2 on mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
            {serviceCards.map((card, index) => (
              <Link
                key={index}
                href={card.href}
                className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-[4/3] group cursor-pointer transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 active:scale-[0.98] shadow-lg"
                style={{
                  transitionDelay: `${index * 50}ms`
                }}
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${card.image})` }}
                />
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} group-hover:opacity-50 transition-opacity duration-300`} />
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                {/* Title */}
                <div className="absolute inset-0 p-3 sm:p-4 flex items-end">
                  <h4 className="text-white text-xs sm:text-sm md:text-base font-semibold leading-tight drop-shadow-lg">
                    {card.title}
                  </h4>
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
