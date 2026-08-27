"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

const industries = [
  {
    id: 1,
    slug: "healthcare",
    name: "Healthcare",
    href: "/industries/healthcare",
    image: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=1600&q=80",
    line: "Clinic systems and patient apps that staff can open without a training day.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
      </svg>
    ),
  },
  {
    id: 2,
    slug: "finance-banking",
    name: "Finance & Banking",
    href: "/industries/finance-banking",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
    line: "Ledgers, portals, and dashboards where the numbers have to be right the first time.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
      </svg>
    ),
  },
  {
    id: 3,
    slug: "ecommerce-retail",
    name: "E-commerce & Retail",
    href: "/industries/ecommerce-retail",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
    line: "Catalogues, checkout, and stock that still work when the store is busy.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM9 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
      </svg>
    ),
  },
  {
    id: 4,
    slug: "education",
    name: "Education & E-learning",
    href: "/industries/education",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80",
    line: "Course platforms and school portals students can actually finish a lesson on.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path d="M12 14v7" />
      </svg>
    ),
  },
  {
    id: 5,
    slug: "real-estate",
    name: "Real Estate",
    href: "/industries/real-estate",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    line: "Listings, viewings, and agent tools without the 2004 website feel.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-6h6v6" />
      </svg>
    ),
  },
  {
    id: 6,
    slug: "logistics",
    name: "Logistics & Transportation",
    href: "/industries/logistics",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1600&q=80",
    line: "Tracking, dispatch, and warehouse screens built for people on the floor.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 3h5v5M4 20L20.2 3.8M21 16v5h-5M15 15l5.1 5.1M4 4l5 5" />
        <circle cx="8.5" cy="8.5" r="2.5" />
      </svg>
    ),
  },
  {
    id: 7,
    slug: "entertainment-media",
    name: "Entertainment & Media",
    href: "/industries/entertainment-media",
    image: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=1600&q=80",
    line: "Streaming, booking, and content sites that stay smooth on a phone.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 8h20M6 4v4M10 4v4M14 4v4M18 4v4" />
      </svg>
    ),
  },
  {
    id: 8,
    slug: "manufacturing",
    name: "Manufacturing",
    href: "/industries/manufacturing",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80",
    line: "Shop-floor software that talks to the machines you already paid for.",
    icon: (
      <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32a.49.49 0 0 0-.6-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.49.49 0 0 0-.6.22L2.74 8.87c-.12.2-.07.47.12.61l2.03 1.58c-.04.31-.06.62-.06.94 0 .32.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.6.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.04.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.07.48 0 .6-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.03-1.58ZM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2Z" />
      </svg>
    ),
  },
  {
    id: 9,
    slug: "hospitality-travel",
    name: "Hospitality & Travel",
    href: "/industries/hospitality-travel",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
    line: "Bookings, rooms, and guest apps that the front desk will keep using.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M2 14h20M4 10h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z" />
      </svg>
    ),
  },
  {
    id: 10,
    slug: "telecommunications",
    name: "Telecommunications",
    href: "/industries/telecommunications",
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=80",
    line: "Network ops and customer portals that stay up when the traffic spikes.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8.111 16.404a5.5 5.5 0 0 1 7.778 0M12 20h.01M5.636 13.636a9 9 0 0 1 12.728 0M2.05 10.636a13.5 13.5 0 0 1 19.9 0" />
      </svg>
    ),
  },
];

type IndustryItem = (typeof industries)[number];

const CYCLE_MS = 3400;
const ITEM_GAP = 72;

function wrapOffset(index: number, position: number, count: number) {
  let d = index - position;
  const half = count / 2;
  while (d > half) d -= count;
  while (d < -half) d += count;
  return d;
}

function shortestDelta(from: number, to: number, count: number) {
  let d = ((to - from) % count + count) % count;
  if (d > count / 2) d -= count;
  return d;
}

export default function IndustriesImpact() {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [eyebrow, setEyebrow] = useState("Industries we serve");
  const [heading, setHeading] = useState("Transforming Industries, Empowering Growth");
  const [items, setItems] = useState<IndustryItem[]>(industries);
  const sectionRef = useRef<HTMLElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const count = items.length;
  const dragRef = useRef({
    active: false,
    startY: 0,
    startPos: 0,
    moved: false,
    pointerId: -1,
  });
  positionRef.current = position;

  const active = count ? ((Math.round(position) % count) + count) % count : 0;
  const current = items[active] || items[0];

  const goTo = (index: number) => {
    setPosition((p) => {
      const from = ((Math.round(p) % count) + count) % count;
      return p + shortestDelta(from, index, count);
    });
  };

  const snap = () => {
    setPosition((p) => Math.round(p));
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/cms/content?type=homepage").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/cms/industries").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([homeData, industriesData]) => {
        if (cancelled) return;
        const hp = homeData?.homepage as Record<string, unknown> | undefined;
        if (hp?.industriesHeading) setHeading(String(hp.industriesHeading));
        if (hp?.industriesSubheading) setEyebrow(String(hp.industriesSubheading));
        const list = industriesData?.industries as
          | {
              slug?: string;
              title?: string;
              name?: string;
              subtitle?: string;
              description?: string;
              shortDescription?: string;
              cardImage?: string;
            }[]
          | undefined;
        if (list?.length) {
          const bySlug = new Map(industries.map((i) => [i.slug, i]));
          const mapped = list
            .filter((i) => i.slug)
            .map((i, idx) => {
              const local = bySlug.get(String(i.slug)) || industries[idx % industries.length];
              const name = String(i.title || i.name || local.name);
              const line = String(i.subtitle || i.shortDescription || i.description || local.line);
              const image = String(i.cardImage || local.image);
              return {
                ...local,
                id: idx + 1,
                slug: String(i.slug),
                name,
                line,
                image,
                href: `/industries/${i.slug}`,
              };
            });
          if (mapped.length) setItems(mapped);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

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

  useEffect(() => {
    if (!isVisible || paused || dragging) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = window.setInterval(() => {
      setPosition((p) => Math.round(p) + 1);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [isVisible, paused, dragging, position]);

  useEffect(() => {
    const el = reelRef.current;
    if (!el) return;
    const drag = dragRef.current;
    let wheelTimer = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      drag.active = true;
      drag.moved = false;
      drag.startY = e.clientY;
      drag.startPos = positionRef.current;
      drag.pointerId = e.pointerId;
      el.setPointerCapture(e.pointerId);
      setDragging(true);
      setPaused(true);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!drag.active || drag.pointerId !== e.pointerId) return;
      const dy = e.clientY - drag.startY;
      if (Math.abs(dy) > 6) drag.moved = true;
      setPosition(drag.startPos - dy / ITEM_GAP);
      e.preventDefault();
    };

    const onPointerUp = (e: PointerEvent) => {
      if (drag.pointerId !== e.pointerId) return;
      drag.active = false;
      setDragging(false);
      snap();
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      window.setTimeout(() => setPaused(false), 800);
    };

    const onClickCapture = (e: MouseEvent) => {
      if (!drag.moved) return;
      e.preventDefault();
      e.stopPropagation();
      drag.moved = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setPaused(true);
      setPosition((p) => p + e.deltaY / ITEM_GAP);
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => {
        snap();
        setPaused(false);
      }, 140);
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove, { passive: false });
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("click", onClickCapture, true);
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.clearTimeout(wheelTimer);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("click", onClickCapture, true);
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-white py-16 sm:py-20 md:py-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
        <div
          className={`mb-8 md:mb-12 text-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#0055FF] mb-3">
            {eyebrow}
          </p>
          <h2 className="whitespace-nowrap font-semibold tracking-tight text-[#1a1a2e] leading-[1.15] text-[clamp(1.05rem,4.1vw,2.6rem)]">
            {heading}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] gap-8 lg:gap-10 items-center">
          <div
            className={`transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
          >
            <div
              ref={reelRef}
              className={`relative h-[300px] sm:h-[340px] overflow-hidden select-none ${
                dragging ? "cursor-grabbing" : "cursor-grab"
              }`}
              style={{
                perspective: "900px",
                touchAction: "none",
                maskImage: "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
              }}
            >
              <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
                {items.map((industry, index) => {
                  const offset = wrapOffset(index, position, count);
                  const hidden = Math.abs(offset) > 2.2;
                  const isActive = Math.abs(offset) < 0.5;
                  return (
                    <button
                      key={industry.id}
                      type="button"
                      aria-label={industry.name}
                      aria-pressed={isActive}
                      onClick={() => {
                        if (dragRef.current.moved) return;
                        goTo(index);
                      }}
                      className="absolute left-0 right-0 flex items-center gap-4 px-2 sm:px-4"
                      style={{
                        top: "50%",
                        opacity: hidden ? 0 : 1 - Math.abs(offset) * 0.28,
                        pointerEvents: hidden ? "none" : "auto",
                        zIndex: 10 - Math.abs(Math.round(offset)),
                        transform: `translateY(-50%) translateY(${offset * ITEM_GAP}px) translateZ(${-Math.abs(offset) * 55}px) rotateX(${offset * -14}deg) scale(${1 - Math.abs(offset) * 0.08})`,
                        transition: dragging
                          ? "none"
                          : "transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 500ms ease",
                      }}
                    >
                      <span
                        className={`flex items-center justify-center rounded-full border shrink-0 transition-colors duration-500 ${
                          isActive
                            ? "w-12 h-12 sm:w-14 sm:h-14 border-[#0055FF]/30 bg-[#0055FF] text-white shadow-[0_10px_22px_rgba(0,85,255,0.28)]"
                            : "w-10 h-10 border-slate-200 bg-white text-slate-500"
                        }`}
                      >
                        {industry.icon}
                      </span>
                      <span
                        className={`text-left font-medium leading-snug transition-colors duration-500 ${
                          isActive ? "text-[#1a1a2e] text-lg sm:text-xl" : "text-slate-400 text-[15px] sm:text-base"
                        }`}
                      >
                        {industry.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-2 px-2 sm:px-4">
              <Link
                href={current.href}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0055FF]"
              >
                View {current.name}
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          <div
            className={`relative h-[340px] sm:h-[420px] lg:h-[460px] rounded-[22px] overflow-hidden bg-slate-100 transition-all duration-700 delay-150 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
          >
            {items.map((industry, index) => (
              <div
                key={industry.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                  index === active ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src={industry.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={`object-cover object-center ${index === active ? "scale-105" : "scale-100"} transition-transform duration-[3400ms] ease-out`}
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
              </div>
            ))}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-white">
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/70 mb-2">
                {current.name}
              </p>
              <p className="text-lg sm:text-xl font-medium leading-snug max-w-md">
                {current.line}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
