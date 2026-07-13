"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { blogPosts, type BlogPost } from "@/data/blogData";

function buildInsights(posts: BlogPost[]) {
  const palette = [
    { categoryColor: "bg-teal-500", gradient: "bg-gradient-to-br from-[#1e3a5f] via-[#2d1b4e] to-[#1a1a2e]", hasOverlay: true, overlayType: "circles" },
    { categoryColor: "bg-orange-500", gradient: "bg-gradient-to-br from-[#7b2d8e] via-[#9c27b0] to-[#e91e63]", hasOverlay: true, overlayType: "innerCircle" },
    { categoryColor: "bg-purple-500", gradient: "bg-gradient-to-br from-[#e91e63] via-[#ff5722] to-[#ff9800]", hasOverlay: true, overlayType: "abstract" },
    { categoryColor: "bg-teal-500", gradient: "", hasOverlay: false, overlayType: "" },
  ];
  return posts.slice(0, 4).map((p, i) => ({
    id: i + 1,
    slug: p.slug,
    category: (p.category || "BUSINESS").toUpperCase(),
    title: p.title,
    image: p.image || "",
    ...palette[i % palette.length],
  }));
}

export default function FeaturedInsights() {
  const [insights, setInsights] = useState(() => buildInsights(blogPosts));
  const [heading, setHeading] = useState("Featured Insights");
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetch("/api/cms/blog")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.posts?.length) setInsights(buildInsights(data.posts));
      })
      .catch(() => {});
    fetch("/api/cms/content?type=homepage")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.homepage?.insightsHeading) setHeading(String(data.homepage.insightsHeading));
      })
      .catch(() => {});
  }, []);

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
      className="w-full bg-[#1a1f2e] py-12 sm:py-14 md:py-16 lg:py-20"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
        {/* Heading */}
        <h2
          className={`text-3xl sm:text-4xl md:text-5xl font-light text-center text-white mb-12 sm:mb-16 md:mb-20 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {heading}
        </h2>

        {/* Two Column Layout - Video Left, Content Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Side - Video */}
          <div 
            className={`relative rounded-2xl overflow-hidden aspect-video lg:aspect-[4/4] transition-all duration-700 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/meeting.mp4" type="video/mp4" />
            </video>
            {/* Optional Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          {/* Right Side - Insights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {insights.slice(0, 4).map((insight, index) => (
              <Link
                href={`/blog/${insight.slug}`}
                key={insight.id}
                className={`group relative overflow-hidden rounded-xl min-h-[160px] sm:min-h-[180px] md:min-h-[200px] transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
              {/* Background - Either Image or Gradient */}
              {insight.image ? (
                <div className="absolute inset-0">
                  <Image
                    src={insight.image}
                    alt={insight.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    unoptimized
                  />
                  {/* Dark Overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>
              ) : (
                <div className={`absolute inset-0 ${insight.gradient}`}>
                  {/* Decorative Overlays based on type */}
                  {insight.overlayType === "circles" && (
                    <div className="absolute inset-0 overflow-hidden">
                      {/* Large circle */}
                      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-tr from-pink-500/60 via-purple-500/40 to-transparent" />
                      {/* Small decorative lines */}
                      <div className="absolute bottom-10 left-10 w-40 h-40">
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-full h-0.5 bg-gradient-to-r from-cyan-400/60 to-transparent origin-left"
                            style={{
                              transform: `rotate(${i * 22.5}deg)`,
                              top: "50%",
                              left: "0",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {insight.overlayType === "innerCircle" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-40 h-40 sm:w-48 sm:h-48">
                        {/* Circular text effect */}
                        <div className="absolute inset-0 rounded-full border-2 border-white/30" />
                        <div className="absolute inset-2 rounded-full border border-white/20" />
                        <div className="absolute inset-4 rounded-full border border-white/10" />
                        {/* Center numbers */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl sm:text-4xl font-light text-white">25</span>
                          <span className="text-white/50 mx-1">|</span>
                          <span className="text-3xl sm:text-4xl font-light text-white">26</span>
                        </div>
                        {/* INNER CIRCLE text */}
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/80 text-xs sm:text-sm tracking-[0.3em] whitespace-nowrap">
                          INNER CIRCLE
                        </div>
                      </div>
                    </div>
                  )}
                  {insight.overlayType === "abstract" && (
                    <div className="absolute inset-0 overflow-hidden">
                      {/* Abstract triangular shapes */}
                      <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white/10 rotate-45" />
                      <div className="absolute bottom-1/3 left-1/3 w-24 h-24 bg-white/5 rotate-12" />
                    </div>
                  )}
                </div>
              )}

                {/* Content */}
                <div className="absolute inset-0 p-4 sm:p-5 flex flex-col">
                  {/* Category Badge */}
                  <span
                    className={`${insight.categoryColor} text-white text-[9px] sm:text-[10px] font-semibold tracking-wider px-2 py-1 rounded-sm w-fit uppercase`}
                  >
                    {insight.category}
                  </span>

                  {/* Title */}
                  <h3 className="text-white text-sm sm:text-base md:text-lg font-medium leading-tight mt-3 max-w-[95%]">
                    {insight.title}
                  </h3>

                  {/* Spacer to push content to top */}
                  <div className="flex-grow" />
                </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </Link>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
