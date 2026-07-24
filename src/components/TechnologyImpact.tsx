"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// Stats data
const stats = [
  {
    id: 1,
    number: "12",
    suffix: "+",
    label: "Years of Industry Experience",
  },
  {
    id: 2,
    number: "50",
    suffix: "+",
    label: "Projects Successfully Delivered",
  },
  {
    id: 3,
    number: "8",
    suffix: "+",
    label: "Countries Served Worldwide",
  },
  {
    id: 4,
    number: "40",
    suffix: "+",
    label: "Happy Clients & Partners",
  },
];

// Animated counter hook
function useCountUp(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, start]);

  return count;
}

// Individual stat component with counter animation
function StatItem({ 
  stat, 
  index, 
  isVisible 
}: { 
  stat: typeof stats[0]; 
  index: number; 
  isVisible: boolean;
}) {
  const count = useCountUp(parseInt(stat.number), 2000, isVisible);

  return (
    <div
      className={`text-center transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 150 + 300}ms` }}
    >
      <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#1a1a2e] mb-2 sm:mb-3">
        {isVisible ? count.toLocaleString() : "0"}{stat.suffix}
      </div>
      <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-[200px] mx-auto">
        {stat.label}
      </p>
    </div>
  );
}

export default function TechnologyImpact() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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

  return (
    <section
      ref={sectionRef}
      className="w-full bg-[#f8f9fa] py-16 sm:py-20 md:py-28 lg:py-32"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Side - Text Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-[#1a1a2e] leading-tight mb-6 sm:mb-8">
              Turning Technology Into
              <br />
              Real Business Impact
            </h2>
            
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8 max-w-[500px]">
              We don't just build software we build outcomes. Every project is guided by one question: Does this genuinely move your business forward? That focus is what turns technology into growth, and growth into lasting success.
            </p>

            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-[#f97316] hover:text-[#ea580c] font-semibold text-sm sm:text-base uppercase tracking-wider transition-colors duration-300 group"
            >
              LEARN MORE
              <svg 
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Right Side - Stats Grid */}
          <div className="grid grid-cols-2 gap-8 sm:gap-10 md:gap-12">
            {stats.map((stat, index) => (
              <StatItem
                key={stat.id}
                stat={stat}
                index={index}
                isVisible={isVisible}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
