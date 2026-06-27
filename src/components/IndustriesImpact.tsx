"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

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
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16">
            <span className="text-gray-400 hover:text-gray-500 transition-colors text-lg font-medium">Google Cloud</span>
            <span className="text-gray-400 hover:text-gray-500 transition-colors text-lg font-medium">AWS</span>
            <span className="text-gray-400 hover:text-gray-500 transition-colors text-lg font-medium">Microsoft Azure</span>
            <span className="text-gray-400 hover:text-gray-500 transition-colors text-lg font-medium">Stripe</span>
            <span className="text-gray-400 hover:text-gray-500 transition-colors text-lg font-medium">Shopify</span>
            <span className="text-gray-400 hover:text-gray-500 transition-colors text-lg font-medium">MongoDB</span>
          </div>
        </div>

      </div>
    </section>
  );
}12.06.39.04.75.1 1.13.17.37.08.72.16 1.05.26.33.1.59.2.79.3.27.14.47.28.58.42.11.14.16.32.16.55v.73c0 .33-.13.5-.37.5-.13 0-.34-.06-.62-.19-1.05-.48-2.22-.71-3.52-.71-.86 0-1.54.13-2.02.41-.48.27-.73.68-.73 1.26 0 .43.15.79.46 1.08.31.29.88.57 1.71.83l2.22.7c1.12.36 1.93.86 2.44 1.5.5.64.75 1.38.75 2.19 0 .68-.14 1.29-.41 1.83-.28.54-.66 1.01-1.15 1.4-.49.4-1.08.69-1.77.9-.72.21-1.47.32-2.28.32l-.03-.02z"/>
                <path fill="#F90" d="M43.7 25.38c-4.37 3.24-10.7 4.97-16.15 4.97-7.64 0-14.52-2.83-19.72-7.53-.41-.37-.04-.88.45-.59 5.62 3.27 12.57 5.24 19.75 5.24 4.84 0 10.17-1 15.06-3.08.74-.32 1.36.48.61 1l.01-.01z"/>
                <path fill="#F90" d="M45.57 23.26c-.56-.71-3.69-.34-5.1-.17-.43.05-.5-.32-.11-.59 2.5-1.76 6.6-1.25 7.08-.66.48.59-.13 4.7-2.47 6.66-.36.3-.7.14-.55-.26.53-1.32 1.7-4.27 1.14-4.98h.01z"/>
              </svg>
            </div>
            
            {/* Atlassian */}
            <div className="hover:opacity-80 transition-opacity">
              <svg className="w-24 h-7" viewBox="0 0 150 32">
                <path fill="#737373" d="M48.7 9.4h3.3l6.2 14.4h-3.5l-1.3-3.2h-6.2l-1.3 3.2h-3.4l6.2-14.4zm3.7 8.7l-2-5.1-2.1 5.1h4.1zm10.5-3.2v8.9h-3.1V9.4h2.9l.2 1.5c.9-1.2 2.3-1.8 3.7-1.8v3c-1.9-.1-3.7.8-3.7 3.8zm6.7 8.9V14.5h-2.2v-2.6h2.2V9.1h3.1v2.8h2.7v2.6h-2.7v7.8c0 .7.3 1.1 1.1 1.1h1.6v2.5h-2.3c-2.3 0-3.5-1.2-3.5-3.1zm9.8-12.6h3.1v12.6h-3.1V11.2zm1.5-1.6c-1 0-1.9-.8-1.9-1.8s.8-1.8 1.9-1.8c1 0 1.9.8 1.9 1.8-.1 1-.9 1.8-1.9 1.8zm5.4 14.2V9.4h2.9l.2 1.5c.8-1.1 2.1-1.8 3.6-1.8 2.8 0 4.4 1.9 4.4 4.8v9.9h-3.1v-9.2c0-1.6-.8-2.6-2.2-2.6-1.5 0-2.7 1.1-2.7 3v8.8h-3.1zm22.1-4.3c-.6 2.8-3 4.6-6.1 4.6-3.8 0-6.5-2.7-6.5-6.6s2.7-6.6 6.3-6.6c3.8 0 6.2 2.6 6.2 6.3v1h-9.3c.2 2 1.6 3.3 3.5 3.3 1.5 0 2.6-.7 3-1.9l2.9-.1zm-6.2-6.1c-1.7 0-2.9 1.1-3.2 2.8h6.2c-.1-1.7-1.3-2.8-3-2.8z"/>
                <path fill="#737373" d="M23.3 18.2c-.3-.5-.9-.5-1.2 0L16.4 31c-.2.4-.1.9.4 1h10c.3 0 .6-.2.8-.5 1.1-2.2.5-7.9-2.8-14.3h-1.5z"/>
                <path fill="#737373" d="M17.8 5.5c-3.4 6.2-3.8 13-1 18.4l5.4 10.5c.2.3.5.5.8.5h10c.5-.1.6-.5.4-1L18.7 5.5c-.3-.6-1.3-.6-1.6 0h.7z"/>
              </svg>
            </div>
            
            {/* Stripe */}
            <div className="hover:opacity-80 transition-opacity">
              <svg className="w-14 h-6" viewBox="0 0 60 25">
                <path fill="#737373" d="M5 10.1c0-.6.5-.9 1.3-.9 1.2 0 2.7.4 3.9 1v-3.7c-1.3-.5-2.6-.7-3.9-.7C3.1 5.8.5 7.8.5 10.9c0 4.8 6.6 4 6.6 6.1 0 .7-.6 1-1.5 1-1.3 0-3-.5-4.3-1.3v3.8c1.4.6 2.9.9 4.3.9 3.3 0 5.6-1.6 5.6-4.8 0-5.2-6.2-4.2-6.2-6.5zm14.9-4.2l-3.3.7v11.8c0 2.2 1.6 3.8 3.8 3.8 1.2 0 2.1-.2 2.6-.5v-3c-.4.2-2.6.8-2.6-1.2v-4.8h2.6v-3.2h-2.6l-.5-3.6zm7.3 4.8l-.2-1.4H23v13.2h4V11.8c.9-1.2 2.5-1 3-.8v-3.7c-.5-.2-2.4-.6-3.3 1.4h-.5zm6.8-2.4c0-.6.5-.9 1.3-.9 1.2 0 2.7.4 3.9 1v-3.6c-1.3-.5-2.6-.7-3.9-.7-3.2 0-5.8 2-5.8 5.1 0 4.8 6.6 4 6.6 6.1 0 .7-.6 1-1.5 1-1.3 0-3-.5-4.3-1.3v3.7c1.4.6 2.9.9 4.3.9 3.3 0 5.6-1.6 5.6-4.8 0-5.1-6.2-4.2-6.2-6.5zm13.6-3c-1.6 0-2.7.8-3.3 1.3l-.2-1h-3.6v17.6l4-.9v-4.3c.6.4 1.4 1 2.8 1 2.9 0 5.5-2.3 5.5-7.4-.1-4.6-2.7-6.3-5.2-6.3zm-.9 9.9c-.9 0-1.5-.3-1.9-.8v-6.1c.4-.5 1-.8 1.9-.8 1.5 0 2.5 1.6 2.5 3.8 0 2.3-1 3.9-2.5 3.9zm15.7-3.6c0-3.6-1.7-6.4-5-6.4s-5.3 2.8-5.3 6.4c0 4.2 2.4 6.3 5.8 6.3 1.7 0 2.9-.4 3.9-.9v-3c-1 .5-2.1.8-3.5.8-1.4 0-2.6-.5-2.8-2.2h7c0-.2-.1-1-.1-2zm-7-1.3c0-1.6 1-2.3 1.9-2.3s1.8.7 1.8 2.3h-3.7z"/>
              </svg>
            </div>
            
            {/* Shopify */}
            <div className="hover:opacity-80 transition-opacity">
              <svg className="w-20 h-6" viewBox="0 0 109 32">
                <path fill="#737373" d="M25.6 7.4c0-.1-.1-.2-.2-.2-.1 0-2.2-.2-2.2-.2l-1.5-1.5c-.1-.1-.4-.2-.5-.1l-.8.2c-.5-1.4-1.3-2.7-2.8-2.7h-.1c-.4-.5-.9-.8-1.4-.8-3.5 0-5.2 4.4-5.7 6.6l-2.4.8c-.8.2-.8.3-.9 1l-1.8 14 13.2 2.5 7.2-1.6c-.1 0-1-6.9-1.1-18zM18.2 6l-2.9.9c.3-1.1.8-2.2 1.5-2.9.3-.3.6-.5 1-.6.4.8.4 1.8.4 2.6zm-2.5-3.4c.3 0 .6.1.9.4-.4.2-.7.5-1 .8-.9 1-1.6 2.6-1.9 4.1l-2.4.7c.5-1.9 2-5.9 4.4-6zm.6 12.6s-.9-.5-2-.5c-1.6 0-1.7 1-1.7 1.3 0 1.4 3.6 1.9 3.6 5.1 0 2.5-1.6 4.1-3.8 4.1-2.6 0-3.9-1.6-3.9-1.6l.7-2.3s1.4 1.2 2.5 1.2c.8 0 1.1-.6 1.1-1.1 0-1.8-3-1.9-3-4.8 0-2.5 1.8-4.9 5.3-4.9 1.4 0 2.1.4 2.1.4l-.9 3.1zm2.1-9c0-.7 0-1.6-.3-2.3.9.2 1.4 1.1 1.7 1.7l-1.4.6zM40.6 15.4c-1.1-.6-1.6-.8-1.6-1.4 0-.7.6-1 1.2-1 .9 0 1.7.4 1.7.4l.7-2.2s-.6-.4-2.3-.4c-2.4 0-4.1 1.4-4.1 3.4 0 1.1.8 2 1.9 2.6 .9.5 1.2.9 1.2 1.4 0 .6-.4 1-1.3 1-.9 0-2.1-.5-2.1-.5l-.7 2.2s.9.6 2.6.6c2.5 0 4.3-1.2 4.3-3.5.1-1.2-.9-2.1-1.5-2.6zm9.3-4.8c-1.2 0-2.2.6-2.9 1.5l-.1-.1 1.1-5.6H45l-2.7 14.1h2.9l.9-4.9c.4-1.8 1.4-3 2.3-3 .7 0 .9.4.9 1.1 0 .4 0 .9-.1 1.3l-1.1 5.5h2.9l1.1-5.7c.2-.7.2-1.4.2-2 0-1.5-.8-2.2-2.4-2.2zm9.2 0c-3.4 0-5.6 3.1-5.6 6.5 0 2.2 1.4 4 4 4 3.3 0 5.5-3 5.5-6.5.1-2-1.2-4-3.9-4zm-.5 8c-1 0-1.4-.8-1.4-1.9 0-1.6.8-3.7 2.4-3.7 1.1 0 1.4.9 1.4 1.7 0 1.8-.9 3.9-2.4 3.9zm12.6-8c-1.9 0-2.9 1.7-2.9 1.7h-.1l.2-1.5h-2.6c-.1 1.1-.4 2.8-.6 4l-1.9 10h2.9l.8-4.1h.1s.6.4 1.6.4c3.3 0 5.4-3.4 5.4-6.8.1-1.9-.8-3.7-2.9-3.7zm-2.3 8.1c-.7 0-1.1-.4-1.1-.4l.5-2.6c.3-1.7 1.3-2.8 2.3-2.8.9 0 1.2.8 1.2 1.7 0 1.8-1.1 4.1-2.9 4.1zm10.2-12.3c-.9 0-1.6.7-1.6 1.7s.7 1.4 1.5 1.4c.9 0 1.7-.6 1.7-1.7s-.6-1.4-1.6-1.4zm-3.6 15.1h2.9l1.9-10.1h-2.9l-1.9 10.1zm12.2-10.1h-2l.1-.4c.2-1.1.8-2.1 1.8-2.1.6 0 1 .2 1 .2l.6-2.3s-.5-.3-1.5-.3c-1 0-1.9.3-2.6.8-.9.7-1.6 1.9-1.9 3.4l-.1.6h-1.3l-.4 2.2h1.3l-1.5 7.9h2.9l1.5-7.9h2l.1-2.1zm7.9.1s-1.8 4.5-2.7 7h-.1l-.6-7h-3l1.5 8.2c0 .2 0 .3-.1.4-.3.5-.7 1-1.2 1.4-.4.3-.9.6-1.4.7l.8 2.5c.6-.1 1.9-.7 2.9-1.8 1.4-1.4 2.6-3.7 3.9-6.8l1.8-4.6h-1.8z"/>
              </svg>
            </div>
            
            {/* MongoDB */}
            <div className="hover:opacity-80 transition-opacity">
              <svg className="w-24 h-6" viewBox="0 0 111 24">
                <path fill="#737373" d="M26.5 14.3c0 .5-.2.9-.5 1.2-.3.3-.7.4-1.3.4-.5 0-.9-.1-1.3-.4-.3-.3-.5-.7-.5-1.2v-7c0-.5.2-.9.5-1.2.3-.3.7-.4 1.3-.4.5 0 1 .1 1.3.4.3.3.5.7.5 1.2v7zm-1.8-11c-1.3 0-2.4.4-3.2 1.2-.9.8-1.3 1.9-1.3 3.2v6.5c0 1.3.4 2.4 1.3 3.2.9.8 2 1.2 3.2 1.2 1.3 0 2.4-.4 3.2-1.2.9-.8 1.3-1.9 1.3-3.2v-6.5c0-1.3-.4-2.4-1.3-3.2-.8-.8-1.9-1.2-3.2-1.2zm18.5 5.1V18h-2.7V8.4c0-.5.2-.9.5-1.2.3-.3.7-.5 1.2-.5.4 0 .8.1 1.1.4l5.7 6.7V6.7h2.7v9.7c0 .5-.2.9-.5 1.2-.3.3-.7.5-1.2.5-.4 0-.8-.1-1.1-.4l-5.7-6.3zm-7.9-1.1c-.9 0-1.7.2-2.3.6-.6.4-.9.9-.9 1.7v4.7c0 .7.3 1.3.9 1.7.6.4 1.4.6 2.3.6s1.7-.2 2.3-.6c.6-.4.9-1 .9-1.7V9.6c0-.7-.3-1.3-.9-1.7-.7-.4-1.4-.6-2.3-.6zm.6 7c0 .2-.1.3-.2.4-.1.1-.3.1-.4.1s-.3 0-.4-.1c-.1-.1-.2-.2-.2-.4V9.6c0-.2.1-.3.2-.4.1-.1.2-.1.4-.1s.3 0 .4.1c.1.1.2.2.2.4v4.7zm28.4.2L61 6.7h2.3l2.4 5.5 2.4-5.5h2.3l-5.3 11.6h-2.3l1.5-3.3zm25.9-3.6h2.3c0 .3-.1.6-.2.8s-.2.4-.4.6c-.2.2-.4.3-.7.4-.3.1-.6.2-.9.2-.5 0-1-.2-1.3-.5-.4-.3-.5-.8-.5-1.4V9.1c0-.6.2-1 .5-1.4.4-.3.8-.5 1.3-.5.6 0 1.1.2 1.4.5.3.3.5.8.5 1.4h2.4c0-.7-.1-1.3-.4-1.8-.3-.5-.6-1-1.1-1.3-.5-.3-1-.6-1.6-.7-.6-.2-1.2-.2-1.8-.2-.5 0-1.1.1-1.6.2-.5.2-1 .4-1.4.8-.4.3-.8.7-1 1.2-.3.5-.4 1-.4 1.7v3.3c0 .6.1 1.2.4 1.7.3.5.6.9 1 1.2.4.3.9.6 1.4.8.5.2 1.1.2 1.6.2.6 0 1.2-.1 1.8-.2.6-.2 1.1-.4 1.6-.7.5-.3.8-.8 1.1-1.3.3-.5.4-1.2.4-1.8l-.4.1zm6.7-7.4h4c.7 0 1.3.1 1.8.3.5.2 1 .5 1.3.9.4.4.6.8.8 1.4.2.5.3 1.1.3 1.7s-.1 1.2-.3 1.7c-.2.5-.5 1-.8 1.4-.4.4-.8.7-1.3.9-.5.2-1.1.3-1.8.3h-4V4.5zm2.7 6.4h.9c.8 0 1.3-.2 1.7-.5.4-.3.5-.8.5-1.5s-.2-1.1-.5-1.5c-.4-.3-.9-.5-1.7-.5h-.9v4zm12.5-3.7c-.5 0-1-.2-1.4-.5-.4-.3-.6-.8-.6-1.4h-2.4c0 1.3.4 2.3 1.2 3 .8.7 1.9 1.1 3.2 1.1 1.2 0 2.1-.3 2.9-.9.8-.6 1.1-1.4 1.1-2.5 0-.5-.1-.9-.2-1.3-.2-.4-.4-.7-.7-1-.3-.3-.6-.5-1-.7-.4-.2-.8-.3-1.2-.4l-1.3-.3c-.5-.1-.8-.3-1-.5-.2-.2-.3-.4-.3-.7 0-.3.1-.5.4-.7.2-.2.6-.3 1-.3.5 0 .9.1 1.2.4.3.2.5.6.5 1h2.3c0-1.1-.4-2-1.1-2.6-.7-.7-1.7-1-2.9-1-1.1 0-2 .3-2.7.9-.7.6-1.1 1.3-1.1 2.4 0 .8.2 1.5.7 2 .5.5 1.2.9 2.1 1.1l1.5.3c.5.1.8.3 1.1.5.2.2.4.5.4.8 0 .4-.2.7-.5.9-.3.2-.7.4-1.1.4zm8-5.3V18H87V4.5h4.6c.6 0 1.2.1 1.7.3.5.2 1 .5 1.4.8.4.4.7.8.9 1.3.2.5.4 1.1.4 1.7 0 .4-.1.8-.2 1.2-.1.4-.3.7-.5 1-.2.3-.5.6-.8.8-.3.2-.7.4-1 .5l2.8 5.9h-3l-2.4-5.3h-1.3zm0-2.1h1.5c.5 0 .9-.1 1.2-.4.3-.3.4-.6.4-1.1 0-.5-.1-.8-.4-1.1-.3-.3-.7-.4-1.2-.4h-1.5v3zM9.7 22.6c-.2-1.7-.2-3.3.2-3.3.4-.1.5 1.7 1 3.2.1-1.8.5-4 1-4 .5-.1.7 1.9.9 3.5.3-1.9.8-4.4 1.4-4.3.7.1.6 2.9.5 5.2l.2-.1c1.8-.7 3.1-2.3 3.1-4.2 0-1.2-.4-2.2-1.1-3-.1-.1-.1-.3 0-.4l.2-.1c.1-.1.3 0 .4.1.9 1 1.3 2.2 1.3 3.5 0 2.3-1.7 4.3-4 4.9-.1 0-.2 0-.3-.1-.1-.1-.1-.2-.1-.3-.1-2-.3-4.6-.6-4.6-.3 0-.7 2.3-.7 4.3 0 .1-.1.2-.1.2-.1.1-.2.1-.3 0-1.3-.5-2.2-1.6-2.6-2.9-.1.2-.1.4-.2.5 0 .2-.1.3-.2.3-.2 0-.3-.2-.4-.3-.7-1.4-.8-3.1-.4-4.6v-.1s0-.1.1-.1c.1-.1.2 0 .2 0 .1 0 .1.1.1.2.2.9.2 1.8.1 2.6.4-1 1-2 1.8-2.7.1-.1.3-.1.4 0s.1.3 0 .4c-.9.8-1.5 1.9-1.8 3-.1.4-.2.8-.2 1.2 0 0 0 .1.1.1.1.2.2.5.3.9.3-1.3.8-2.6 1.5-3.7.1-.1.3-.2.4-.1.1.1.2.3.1.4-.9 1.5-1.4 3.3-1.5 5.1 0 .2-.2.3-.3.3-.2 0-.3-.1-.4-.2zm1.6-9.2c-.1-.1-.1-.2-.1-.3l.3-3.2c0-.1.1-.2.2-.2.1 0 .2.1.2.2 0 0 .2 2.6.7 3.1.5.5 2.9 1.3 2.9 1.3.1 0 .2.1.2.2 0 .1-.1.2-.2.2 0 0-2.5.7-3.1.8-.5.1-1.1-2-1.1-2.1z"/>
              </svg>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
