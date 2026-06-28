"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// Technology partner logos (official full-color brand logos)
const techPartners = [
  { name: "Google Cloud", url: "https://cloud.google.com", logo: "https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg" },
  { name: "Amazon Web Services", url: "https://aws.amazon.com", logo: "https://www.vectorlogo.zone/logos/amazon_aws/amazon_aws-icon.svg" },
  { name: "Microsoft Azure", url: "https://azure.microsoft.com", logo: "https://www.vectorlogo.zone/logos/microsoft_azure/microsoft_azure-icon.svg" },
  { name: "Oracle", url: "https://www.oracle.com", logo: "https://www.vectorlogo.zone/logos/oracle/oracle-icon.svg" },
  { name: "IBM", url: "https://www.ibm.com", logo: "https://www.vectorlogo.zone/logos/ibm/ibm-icon.svg" },
  { name: "Docker", url: "https://www.docker.com", logo: "https://www.vectorlogo.zone/logos/docker/docker-icon.svg" },
  { name: "Kubernetes", url: "https://kubernetes.io", logo: "https://www.vectorlogo.zone/logos/kubernetes/kubernetes-icon.svg" },
  { name: "Cloudflare", url: "https://www.cloudflare.com", logo: "https://www.vectorlogo.zone/logos/cloudflare/cloudflare-icon.svg" },
  { name: "GitHub", url: "https://github.com", logo: "https://www.vectorlogo.zone/logos/github/github-icon.svg" },
  { name: "Salesforce", url: "https://www.salesforce.com", logo: "https://www.vectorlogo.zone/logos/salesforce/salesforce-icon.svg" },
];

// Industry data with icons
const industries = [
  {
    id: 1,
    name: "Healthcare",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
      </svg>
    ),
  },
  {
    id: 2,
    name: "Finance & Banking",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
      </svg>
    ),
  },
  {
    id: 3,
    name: "E-commerce & Retail",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM9 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
      </svg>
    ),
  },
  {
    id: 4,
    name: "Education & E-learning",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path d="M12 14v7" />
      </svg>
    ),
  },
  {
    id: 5,
    name: "Real Estate",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-6h6v6" />
      </svg>
    ),
  },
  {
    id: 6,
    name: "Logistics & Transportation",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 3h5v5M4 20L20.2 3.8M21 16v5h-5M15 15l5.1 5.1M4 4l5 5" />
        <circle cx="8.5" cy="8.5" r="2.5" />
      </svg>
    ),
  },
  {
    id: 7,
    name: "Entertainment & Media",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 8h20M6 4v4M10 4v4M14 4v4M18 4v4" />
      </svg>
    ),
  },
  {
    id: 8,
    name: "Manufacturing",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M4 7V4a2 2 0 0 1 2-2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3" />
        <path d="M2 15h10M9 18l3-3-3-3" />
      </svg>
    ),
  },
  {
    id: 9,
    name: "Hospitality & Travel",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M2 14h20M4 10h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z" />
      </svg>
    ),
  },
  {
    id: 10,
    name: "Telecommunications",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8.111 16.404a5.5 5.5 0 0 1 7.778 0M12 20h.01M5.636 13.636a9 9 0 0 1 12.728 0M2.05 10.636a13.5 13.5 0 0 1 19.9 0" />
      </svg>
    ),
  },
];

export default function IndustriesImpact() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Split industries into left and right columns
  const leftColumn = industries.filter((_, index) => index % 2 === 0);
  const rightColumn = industries.filter((_, index) => index % 2 === 1);

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

  const IndustryItem = ({ 
    industry, 
    index, 
    isLeft 
  }: { 
    industry: typeof industries[0]; 
    index: number; 
    isLeft: boolean;
  }) => (
    <div
      className={`group flex items-center justify-between py-5 border-b border-gray-200 cursor-pointer transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
      onMouseEnter={() => setHoveredItem(industry.id)}
      onMouseLeave={() => setHoveredItem(null)}
    >
      <div className="flex items-center gap-4">
        <span className={`text-gray-700 transition-colors duration-300 ${
          hoveredItem === industry.id ? "text-[#0d9488]" : ""
        }`}>
          {industry.icon}
        </span>
        <span className={`text-base sm:text-lg font-medium text-gray-800 transition-colors duration-300 ${
          hoveredItem === industry.id ? "text-[#0d9488]" : ""
        }`}>
          {industry.name}
        </span>
      </div>
      
      {/* Arrow indicator on hover */}
      <div className={`transition-all duration-300 ${
        hoveredItem === industry.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
      }`}>
        <svg 
          className="w-5 h-5 text-[#0d9488]" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      className="w-full bg-white py-16 sm:py-20 md:py-28 lg:py-32"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Heading */}
        <h2 
          className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-[#1a1a2e] mb-12 sm:mb-16 md:mb-20 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          Transforming Industries, Empowering Growth
        </h2>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 lg:gap-x-32">
          {/* Left Column */}
          <div>
            {leftColumn.map((industry, index) => (
              <IndustryItem 
                key={industry.id} 
                industry={industry} 
                index={index} 
                isLeft={true}
              />
            ))}
          </div>

          {/* Right Column */}
          <div>
            {rightColumn.map((industry, index) => (
              <IndustryItem 
                key={industry.id} 
                industry={industry} 
                index={index + leftColumn.length} 
                isLeft={false}
              />
            ))}
          </div>
        </div>

        {/* Technology Partners */}
        <div className={`mt-20 pt-12 border-t border-gray-200 transition-all duration-700 delay-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}>
          <p className="text-xs text-gray-400 tracking-widest uppercase mb-8 text-center">
            Technology Partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-7 sm:gap-x-10 md:gap-x-12">
            {techPartners.map((partner) => (
              <a
                key={partner.name}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                title={partner.name}
                className="grayscale opacity-50 hover:grayscale-0 hover:opacity-100 hover:scale-110 transition-all duration-300"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-9 w-auto object-contain"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
