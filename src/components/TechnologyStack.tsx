"use client";

import { useState } from "react";

type TechCategory = "Frontend" | "Backend" | "Database" | "Infrastructure" | "Design";

const technologies: Record<TechCategory, { name: string; logo: string }[]> = {
  Frontend: [
    { name: "React", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
    { name: "Next.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
    { name: "Vue.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg" },
    { name: "TypeScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
    { name: "JavaScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
    { name: "Tailwind", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
  ],
  Backend: [
    { name: "Node.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
    { name: "Express", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
    { name: "Laravel", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg" },
    { name: "Python", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    { name: "GraphQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg" },
    { name: "PHP", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" },
  ],
  Database: [
    { name: "PostgreSQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
    { name: "MongoDB", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
    { name: "Redis", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" },
    { name: "Firebase", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" },
  ],
  Infrastructure: [
    { name: "AWS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" },
    { name: "Azure", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg" },
    { name: "Docker", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
    { name: "Kubernetes", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg" },
    { name: "Git", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
  ],
  Design: [
    { name: "Figma", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
    { name: "Adobe XD", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/xd/xd-plain.svg" },
    { name: "Illustrator", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/illustrator/illustrator-plain.svg" },
  ],
};

const categories = Object.keys(technologies) as TechCategory[];

export default function TechnologyStack() {
  const [activeTab, setActiveTab] = useState<TechCategory>("Frontend");

  return (
    <section className="w-full bg-white py-16 md:py-24 border-t border-slate-100">
      <div className="max-w-[960px] mx-auto px-5 sm:px-6">
        <div className="text-center mb-10 md:mb-12">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#0055FF] mb-3">
            Stack
          </p>
          <h2 className="text-[28px] sm:text-4xl font-semibold tracking-tight text-[#0f172a] mb-3">
            Technology we ship with
          </h2>
          <p className="text-slate-500 text-[15px] sm:text-base max-w-lg mx-auto leading-relaxed">
            Production tools we use every week — not a logo dump of everything that exists.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-10">
          {categories.map((category) => {
            const isActive = activeTab === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveTab(category)}
                className={`px-3.5 sm:px-4 py-2 text-[13px] sm:text-sm font-medium rounded-full transition-colors ${
                  isActive
                    ? "bg-[#0f172a] text-white"
                    : "text-slate-500 hover:text-[#0f172a] hover:bg-slate-100"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-center gap-x-10 gap-y-8 sm:gap-x-12">
          {technologies[activeTab].map((tech) => (
            <div key={`${activeTab}-${tech.name}`} className="flex flex-col items-center gap-2.5 w-[72px] sm:w-[80px]">
              <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tech.logo} alt="" className="max-h-full max-w-full object-contain" />
              </div>
              <span className="text-[12px] sm:text-[13px] text-slate-600 font-medium text-center leading-tight">
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
