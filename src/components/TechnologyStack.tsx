"use client";

import { useState } from "react";
import Image from "next/image";

type TechCategory = "FRONTEND" | "BACKEND" | "DATABASE" | "INFRA AND DEVOPS" | "DESIGN";

const technologies: Record<TechCategory, { name: string; logo: string }[]> = {
  "FRONTEND": [
    { name: "React", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
    { name: "Next.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
    { name: "Vue.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg" },
    { name: "TypeScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
    { name: "JavaScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
    { name: "Tailwind", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
    { name: "Bootstrap", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg" },
  ],
  "BACKEND": [
    { name: "Node.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
    { name: "Express", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
    { name: "Laravel", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg" },
    { name: "PHP", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" },
    { name: "Python", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    { name: "Flask", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg" },
    { name: "GraphQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg" },
  ],
  "DATABASE": [
    { name: "PostgreSQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
    { name: "MongoDB", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
    { name: "Redis", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" },
    { name: "Firebase", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" },
  ],
  "INFRA AND DEVOPS": [
    { name: "AWS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" },
    { name: "Azure", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg" },
    { name: "Docker", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
    { name: "Kubernetes", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg" },
    { name: "Git", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
  ],
  "DESIGN": [
    { name: "Figma", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
  ],
};

const categories: TechCategory[] = [
  "FRONTEND",
  "BACKEND",
  "DATABASE",
  "INFRA AND DEVOPS",
  "DESIGN",
];


export default function TechnologyStack() {
  const [activeTab, setActiveTab] = useState<TechCategory>("FRONTEND");

  return (
    <section className="w-full bg-[#050B14] py-20 relative overflow-hidden">
      {/* Grid dotted background */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{
          backgroundImage: "radial-gradient(#4b5563 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />
      
      {/* Bottom glowing accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.5)]" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Technology Stack
          </h2>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            We work with a wide range of modern, cutting-edge technologies. From programming languages and frameworks to databases, cloud platforms, and testing environments, our flexible tech stack ensures applications remain scalable, secure, and high-performing as businesses grow.
          </p>
        </div>

        {/* Content Layout */}
        <div className="w-full flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-none">
            {categories.map((category) => {
              const isActive = activeTab === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`flex-shrink-0 text-left px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-bold tracking-wider flex items-center gap-3 transition-all duration-300 ${
                    isActive 
                      ? "bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-white shadow-lg shadow-[#00E1FF]/25" 
                      : "bg-transparent text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? "bg-white" : "bg-white/30"}`} />
                  {category}
                </button>
              );
            })}
          </div>

          {/* Cards Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {technologies[activeTab].map((tech, idx) => (
                <div 
                  key={`${activeTab}-${tech.name}-${idx}`}
                  className="bg-[#121826] border border-white/5 hover:border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:-translate-y-1 shadow-lg group"
                  style={{
                    animation: `fadeIn 0.4s ease-out ${idx * 0.05}s both`
                  }}
                >
                  <div className="w-12 h-12 relative flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tech.logo}
                      alt={tech.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-white text-xs font-semibold tracking-wide text-center">
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
