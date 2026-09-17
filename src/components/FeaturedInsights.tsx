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

export default function FeaturedInsights({
  initialHomepage = null,
  initialPosts = null,
}: {
  initialHomepage?: Record<string, unknown> | null;
  initialPosts?: { slug: string; title: string; category?: string; image?: string }[] | null;
}) {
  const seedPosts = initialPosts?.length
    ? buildInsights(initialPosts as BlogPost[])
    : buildInsights(blogPosts);

  const [insights, setInsights] = useState(() => seedPosts);
  const [eyebrow, setEyebrow] = useState(
    initialHomepage?.insightsEyebrow ? String(initialHomepage.insightsEyebrow) : ""
  );
  const [heading, setHeading] = useState(
    initialHomepage?.insightsHeading
      ? String(initialHomepage.insightsHeading)
      : "Featured Insights"
  );
  const [intro, setIntro] = useState(
    initialHomepage?.insightsIntro ? String(initialHomepage.insightsIntro) : ""
  );
  const [videoUrl, setVideoUrl] = useState(
    initialHomepage?.insightsVideoUrl ? String(initialHomepage.insightsVideoUrl) : "/meeting.mp4"
  );
  const [viewAllLabel, setViewAllLabel] = useState(
    initialHomepage?.insightsViewAllLabel
      ? String(initialHomepage.insightsViewAllLabel)
      : "View all insights"
  );
  const [viewAllHref, setViewAllHref] = useState(
    initialHomepage?.insightsViewAllHref
      ? String(initialHomepage.insightsViewAllHref)
      : "/blog"
  );
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (initialHomepage && initialPosts) return;
    if (!initialPosts?.length) {
      fetch("/api/cms/blog")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.posts?.length) setInsights(buildInsights(data.posts));
        })
        .catch(() => {});
    }
    if (initialHomepage) return;
    fetch("/api/cms/content?type=homepage")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const hp = data?.homepage as Record<string, unknown> | undefined;
        if (!hp) return;
        if (hp.insightsEyebrow) setEyebrow(String(hp.insightsEyebrow));
        if (hp.insightsHeading) setHeading(String(hp.insightsHeading));
        if (hp.insightsIntro) setIntro(String(hp.insightsIntro));
        if (hp.insightsVideoUrl) setVideoUrl(String(hp.insightsVideoUrl));
        if (hp.insightsViewAllLabel) setViewAllLabel(String(hp.insightsViewAllLabel));
        if (hp.insightsViewAllHref) setViewAllHref(String(hp.insightsViewAllHref));
      })
      .catch(() => {});
  }, [initialHomepage, initialPosts]);

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
        <div
          className={`text-center mb-10 sm:mb-12 md:mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {eyebrow ? (
            <p className="text-sm font-semibold tracking-widest uppercase text-[#00E1FF]/80 mb-3">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-white">
            {heading}
          </h2>
          {intro ? (
            <p className="mt-4 text-white/60 text-base sm:text-lg max-w-2xl mx-auto">
              {intro}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
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
              key={videoUrl}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

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
                {insight.image ? (
                  <div className="absolute inset-0">
                    <Image
                      src={insight.image}
                      alt={insight.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/40" />
                  </div>
                ) : (
                  <div className={`absolute inset-0 ${insight.gradient}`}>
                    {insight.hasOverlay && insight.overlayType === "circles" && (
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border border-white/10" />
                        <div className="absolute top-1/2 -left-8 w-28 h-28 rounded-full border border-white/10" />
                      </div>
                    )}
                    {insight.hasOverlay && insight.overlayType === "innerCircle" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full border border-white/15" />
                      </div>
                    )}
                    {insight.hasOverlay && insight.overlayType === "abstract" && (
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white/10 rotate-45" />
                        <div className="absolute bottom-1/3 left-1/3 w-24 h-24 bg-white/5 rotate-12" />
                      </div>
                    )}
                  </div>
                )}

                <div className="absolute inset-0 p-4 sm:p-5 flex flex-col">
                  <span
                    className={`${insight.categoryColor} text-white text-[9px] sm:text-[10px] font-semibold tracking-wider px-2 py-1 rounded-sm w-fit uppercase`}
                  >
                    {insight.category}
                  </span>
                  <h3 className="text-white text-sm sm:text-base md:text-lg font-medium leading-tight mt-3 max-w-[95%]">
                    {insight.title}
                  </h3>
                  <div className="flex-grow" />
                </div>

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </Link>
            ))}
          </div>
        </div>

        {viewAllLabel && viewAllHref ? (
          <div
            className={`mt-10 sm:mt-12 text-center transition-all duration-700 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#00E1FF] hover:text-white transition-colors"
            >
              {viewAllLabel}
              <span aria-hidden>→</span>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
