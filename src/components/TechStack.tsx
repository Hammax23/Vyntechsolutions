"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

// Tech stack categories with logos
const techStacks = [
  // Web Development
  { id: 1, name: "React", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg", category: "Web Development" },
  { id: 2, name: "Next.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg", category: "Web Development" },
  { id: 3, name: "Vue.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg", category: "Web Development" },
  { id: 4, name: "Angular", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg", category: "Web Development" },
  { id: 5, name: "TypeScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg", category: "Web Development" },
  { id: 6, name: "Node.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg", category: "Backend" },

  // Backend & Cloud
  { id: 7, name: "Python", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg", category: "Backend" },
  { id: 8, name: "Java", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg", category: "Backend" },
  { id: 9, name: "AWS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg", category: "Cloud" },
  { id: 10, name: "Azure", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg", category: "Cloud" },
  { id: 11, name: "Google Cloud", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg", category: "Cloud" },
  { id: 12, name: "Docker", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg", category: "DevOps" },

  // Database
  { id: 13, name: "MongoDB", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg", category: "Database" },
  { id: 14, name: "PostgreSQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg", category: "Database" },
  { id: 15, name: "MySQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg", category: "Database" },
  { id: 16, name: "Redis", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg", category: "Database" },
  { id: 17, name: "Firebase", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg", category: "Database" },

  // Mobile Development
  { id: 18, name: "React Native", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg", category: "Mobile" },
  { id: 19, name: "Flutter", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg", category: "Mobile" },
  { id: 20, name: "Swift", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg", category: "Mobile" },
  { id: 21, name: "Kotlin", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg", category: "Mobile" },

  // DevOps & Tools
  { id: 22, name: "Kubernetes", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg", category: "DevOps" },
  { id: 23, name: "Jenkins", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg", category: "DevOps" },
  { id: 24, name: "Git", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg", category: "DevOps" },
  { id: 25, name: "GraphQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg", category: "Backend" },
  { id: 26, name: "Figma", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg", category: "Design" },
  { id: 27, name: "TailwindCSS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg", category: "Web Development" },
];

export default function TechStack() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-scroll effect - continuous scrolling
  useEffect(() => {
    if (!isVisible) return;

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollPosition = 0;
    const scrollSpeed = 1; // pixels per frame

    const animate = () => {
      scrollPosition += scrollSpeed;

      // Reset when reaching half (since we duplicate the logos)
      const halfWidth = scrollContainer.scrollWidth / 2;
      if (scrollPosition >= halfWidth) {
        scrollPosition = 0;
      }

      scrollContainer.scrollLeft = scrollPosition;
    };

    const interval = setInterval(animate, 30);

    return () => clearInterval(interval);
  }, [isVisible]);

  // Duplicate logos for infinite scroll effect
  const duplicatedStacks = [...techStacks, ...techStacks];

  return (
    <section
      ref={sectionRef}
      className="w-full bg-white py-16 sm:py-20 md:py-24 lg:py-28 overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
        {/* Heading */}
        <h2
          className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-[#1a1a2e] mb-12 sm:mb-16 md:mb-20 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
        >
          Our Tech Stack
        </h2>

        {/* Desktop/Tablet Logo Carousel Container */}
        <div
          className={`hidden md:block relative transition-all duration-700 delay-300 ${isVisible ? "opacity-100" : "opacity-0"
            }`}
        >
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 md:w-40 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 md:w-40 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* Scrolling Container */}
          <div
            ref={scrollRef}
            className="flex gap-8 sm:gap-12 md:gap-16 overflow-x-hidden py-4"
          >
            {duplicatedStacks.map((tech, index) => (
              <div
                key={`${tech.id}-${index}`}
                className="flex-shrink-0 cursor-pointer"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 relative flex items-center justify-center bg-white rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-gray-50 hover:border-gray-100">
                    <Image
                      src={tech.logo}
                      alt={tech.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-contain saturate-[1.1] contrast-[1.05]"
                      unoptimized
                    />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500 font-medium tracking-wide whitespace-nowrap">
                    {tech.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Grid Container */}
        <div className={`md:hidden grid grid-cols-4 sm:grid-cols-5 gap-4 sm:gap-6 mt-8 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {techStacks.map((tech) => (
            <div key={tech.id} className="flex flex-col items-center gap-2 cursor-pointer">
              <div className="w-12 h-12 relative flex items-center justify-center bg-white rounded-xl p-2 shadow-sm border border-gray-100">
                <Image
                  src={tech.logo}
                  alt={tech.name}
                  width={32}
                  height={32}
                  className="w-full h-full object-contain saturate-[1.1] contrast-[1.05]"
                  unoptimized
                />
              </div>
              <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium whitespace-nowrap text-center">
                {tech.name}
              </span>
            </div>
          ))}
        </div>

        {/* Category Pills */}
        <div
          className={`flex flex-wrap justify-center gap-3 sm:gap-4 mt-12 sm:mt-16 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
        >
          {["Web Development", "Mobile", "Backend", "Database", "Cloud", "DevOps", "Design"].map(
            (category) => (
              <span
                key={category}
                className="px-4 py-2 sm:px-6 sm:py-2.5 bg-gray-100 hover:bg-[#0d9488] hover:text-white text-gray-700 text-xs sm:text-sm font-medium rounded-full transition-all duration-300 cursor-pointer"
              >
                {category}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
}
