"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const stats = [
  { id: 1, number: "12", suffix: "+", label: "Years of industry experience" },
  { id: 2, number: "50", suffix: "+", label: "Projects successfully delivered" },
  { id: 3, number: "4", suffix: "+", label: "Countries served worldwide" },
  { id: 4, number: "40", suffix: "+", label: "Happy clients & partners" },
];

function useCountUp(end: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration, start]);

  return count;
}

function StatCell({
  stat,
  index,
  isVisible,
}: {
  stat: (typeof stats)[0];
  index: number;
  isVisible: boolean;
}) {
  const count = useCountUp(parseInt(stat.number), 1800, isVisible);

  return (
    <div
      className={`relative px-5 sm:px-8 py-8 sm:py-10 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      }`}
      style={{ transitionDelay: `${220 + index * 110}ms` }}
    >
      <p className="text-[11px] font-medium tracking-[0.16em] uppercase text-slate-500 mb-4">
        {String(index + 1).padStart(2, "0")}
      </p>
      <div className="text-[42px] sm:text-5xl lg:text-[56px] font-light tracking-tight text-white tabular-nums leading-none mb-3">
        {isVisible ? count.toLocaleString() : "0"}
        <span className="text-[#5B9DFF]">{stat.suffix}</span>
      </div>
      <p className="text-[13px] sm:text-sm text-slate-400 leading-snug max-w-[200px]">
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
          if (entry.isIntersecting) setIsVisible(true);
        });
      },
      { threshold: 0.18 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-[#07101C]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <div className="pointer-events-none absolute -top-40 right-0 h-[420px] w-[420px] rounded-full bg-[#0055FF]/20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[280px] w-[280px] rounded-full bg-[#0055FF]/10 blur-[120px]" />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-16 sm:py-20 md:py-28">
        <div
          className={`flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-16 mb-12 md:mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="max-w-[640px]">
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#7EB6FF] mb-4">
              Proven delivery
            </p>
            <h2 className="text-[28px] sm:text-4xl md:text-[2.85rem] font-semibold tracking-tight text-white leading-[1.12]">
              Turning technology into
              <br className="hidden sm:block" /> real business impact
            </h2>
          </div>

          <div className="max-w-[440px] lg:pb-1">
            <p className="text-[15px] sm:text-base text-slate-400 leading-relaxed mb-7">
              We don&apos;t just build software we build outcomes. Every project is guided by one question: Does this genuinely move your business forward? That focus is what turns technology into growth, and growth into lasting success.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 border border-white/20 text-white px-6 py-2.5 text-[12px] font-medium tracking-[0.14em] uppercase hover:bg-white hover:text-[#07101C] transition-colors duration-300"
            >
              About VynTech
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-white/10">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              className={[
                index % 2 === 0 ? "border-r border-white/10" : "",
                index < 2 ? "border-b border-white/10 lg:border-b-0" : "",
                index > 0 ? "lg:border-l lg:border-white/10" : "",
                index % 2 === 0 ? "lg:border-r-0" : "",
              ].join(" ")}
            >
              <StatCell stat={stat} index={index} isVisible={isVisible} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
