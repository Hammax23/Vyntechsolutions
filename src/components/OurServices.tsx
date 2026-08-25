"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";

const GoogleRankingPromo = dynamic(() => import("@/components/GoogleRankingPromo"), {
  ssr: false,
  loading: () => (
    <div className="w-[248px] xl:w-[268px] h-[168px] rounded-xl bg-white/80 border border-white/90 animate-pulse" aria-hidden />
  ),
});

const serviceCards = [
  {
    title: "Generative AI",
    description:
      "We put AI on the jobs your team already does, drafts, support replies, reports, so it saves hours this month, not in a pitch deck.",
    href: "/services/ai-ml-solutions",
    art: "/services/ribbons/ribbon-1.webp",
  },
  {
    title: "Mobile App Development",
    description:
      "iOS and Android apps that feel quick on a real phone. We ship, get them on the stores, and stay on for the updates after launch.",
    href: "/services/mobile-app-development",
    art: "/services/ribbons/ribbon-2.webp",
  },
  {
    title: "DevOps",
    description:
      "Pipelines, servers, and deploys set up so a release is a normal Tuesday, not a late night scramble hoping nothing breaks.",
    href: "/services/devops-cicd",
    art: "/services/ribbons/ribbon-3.webp",
  },
  {
    title: "UI/UX Design",
    description:
      "We sit with how your customers actually click through, then design screens that make the next step obvious. Fewer dead ends, less bounce.",
    href: "/services/ui-ux-design",
    art: "/services/ribbons/ribbon-4.webp",
  },
  {
    title: "Web Development",
    description:
      "Sites and web apps in React and Next.js, fast, easy to edit, built to rank. No bloated templates that look fine until you try to grow.",
    href: "/services/web-development",
    art: "/services/ribbons/ribbon-5.webp",
  },
  {
    title: "Custom Software Development",
    description:
      "Tools written around how your team already works. If you're living in spreadsheets or fighting a clunky system, we replace that.",
    href: "/services/custom-software-development",
    art: "/services/ribbons/ribbon-6.webp",
  },
  {
    title: "Cloud Solutions",
    description:
      "AWS, Azure, or Google Cloud, we move you over, lock it down, and keep an eye on the bill so you're not paying for idle servers.",
    href: "/services/cloud-solutions",
    art: "/services/ribbons/ribbon-7.webp",
  },
  {
    title: "Ecommerce Solutions",
    description:
      "Online stores with checkout, payments, and stock that hold up when it's busy. Shopify or custom, whichever fits the catalogue you have.",
    href: "/services/ecommerce-solutions",
    art: "/services/ribbons/ribbon-8.webp",
  },
  {
    title: "SEO & Digital Marketing",
    description:
      "We fix the pages Google actually cares about, titles, content, speed, links, so the right searches start showing your site, not a vanity report.",
    href: "/services/seo-digital-marketing",
    art: "/services/ribbons/ribbon-9.webp",
  },
  {
    title: "Maintenance & Support",
    description:
      "Updates, backups, and a real person when something's down. We watch the site so you don't find out from a customer.",
    href: "/services/maintenance-support",
    art: "/services/ribbons/ribbon-10.webp",
  },
];

const DEFAULT_SERVICES_BODY =
  "Through Innovation, Technology, and Scalable Digital Solutions";

type ServiceCard = (typeof serviceCards)[number];

function withoutWordDash(text: string) {
  return text
    .replace(/\b[Ee]-commerce\b/g, "Ecommerce")
    .replace(/\b[Ee]-learning\b/g, "Elearning")
    .replace(/(\w)-(\w)/g, "$1 $2");
}

export default function OurServices() {
  const [isVisible, setIsVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [heading, setHeading] = useState("Our Services");
  const [subheading, setSubheading] = useState("Transforming Modern Businesses");
  const [body, setBody] = useState(DEFAULT_SERVICES_BODY);
  const [cards, setCards] = useState<ServiceCard[]>(serviceCards);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef({
    x: 0,
    vx: 0,
    min: 0,
    max: 0,
    dragging: false,
    moved: false,
    pointerId: -1,
    lastX: 0,
    lastT: 0,
    startX: 0,
    startY: 0,
    startTranslate: 0,
    axis: "" as "" | "x" | "y",
    raf: 0,
    snapping: false,
  });

  const useFancyHeading = heading === "Our Services";

  useEffect(() => {
    fetch("/api/cms/content?type=homepage")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const hp = data?.homepage;
        if (!hp) return;
        if (hp.servicesHeading) setHeading(String(hp.servicesHeading));
        if (hp.servicesSubheading) setSubheading(String(hp.servicesSubheading));
        if (hp.servicesBody) setBody(String(hp.servicesBody));
      })
      .catch(() => { });

    fetch("/api/cms/services")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const list = data?.services as { slug?: string; title?: string; description?: string }[] | undefined;
        if (!list?.length) return;
        const homeServices = list.filter(
          (s) => s.slug && s.slug !== "tax-accounting" && !String(s.slug).includes("tax")
        );
        if (!homeServices.length) return;
        setCards(
          homeServices.map((s, i) => {
            const fallback =
              serviceCards.find((c) => c.href.includes(`/${s.slug}`)) ||
              serviceCards[i % serviceCards.length];
            return {
              title: withoutWordDash(String(s.title || fallback.title)),
              description: withoutWordDash(String(s.description || fallback.description)),
              href: `/services/${s.slug}`,
              art: fallback.art,
            };
          })
        );
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      });
    }, observerOptions);

    const cardsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCardsVisible(true);
        }
      });
    }, { threshold: 0.1 });

    if (sectionRef.current) sectionObserver.observe(sectionRef.current);
    if (cardsRef.current) cardsObserver.observe(cardsRef.current);

    return () => {
      sectionObserver.disconnect();
      cardsObserver.disconnect();
    };
  }, []);

  const updateScrollButtons = () => {
    const s = sliderRef.current;
    const prev = s.x < -8;
    const next = s.x > s.max + 8;
    setCanScrollPrev((v) => (v === prev ? v : prev));
    setCanScrollNext((v) => (v === next ? v : next));
  };

  const getCardStep = () => {
    const track = trackRef.current;
    const card = track?.querySelector("a");
    if (!(card instanceof HTMLElement) || !track) return 354;
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 24;
    return card.offsetWidth + gap;
  };

  const scrollByCard = (direction: -1 | 1) => {
    const s = sliderRef.current;
    const target = s.x - direction * getCardStep();
    s.vx = 0;
    s.snapping = true;
    animateSliderTo(target);
  };

  const applySlider = () => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transform = `translate3d(${sliderRef.current.x}px,0,0)`;
  };

  const clampSlider = (value: number, rubber = false) => {
    const s = sliderRef.current;
    if (!rubber) return Math.min(s.min, Math.max(s.max, value));
    if (value > s.min) return s.min + (value - s.min) * 0.22;
    if (value < s.max) return s.max + (value - s.max) * 0.22;
    return value;
  };

  const animateSliderTo = (target: number, duration = 520) => {
    const s = sliderRef.current;
    const from = s.x;
    const to = clampSlider(target, false);
    const start = performance.now();
    cancelAnimationFrame(s.raf);

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      s.x = from + (to - from) * eased;
      applySlider();
      if (t < 1) {
        s.raf = requestAnimationFrame(tick);
      } else {
        s.snapping = false;
        s.vx = 0;
        updateScrollButtons();
      }
    };
    s.raf = requestAnimationFrame(tick);
  };

  const snapSlider = () => {
    const s = sliderRef.current;
    const step = getCardStep();
    const snapped = Math.round(s.x / step) * step;
    s.snapping = true;
    animateSliderTo(snapped, 480);
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const s = sliderRef.current;

    const measure = () => {
      if (s.dragging) return;
      s.min = 0;
      s.max = Math.min(0, viewport.clientWidth - track.scrollWidth);
      s.x = clampSlider(s.x, false);
      applySlider();
      updateScrollButtons();
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);

    const stopRaf = () => {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
    };

    const setDragMode = (on: boolean) => {
      viewport.classList.toggle("is-dragging", on);
      track.style.pointerEvents = on ? "none" : "";
      viewport.style.cursor = on ? "grabbing" : "grab";
    };

    const runInertia = () => {
      stopRaf();
      const tick = () => {
        s.vx *= 0.94;
        s.x += s.vx;
        if (s.x > s.min) {
          s.x = s.min;
          s.vx = 0;
        } else if (s.x < s.max) {
          s.x = s.max;
          s.vx = 0;
        }
        applySlider();
        if (Math.abs(s.vx) > 0.45) {
          s.raf = requestAnimationFrame(tick);
        } else {
          snapSlider();
        }
      };
      s.raf = requestAnimationFrame(tick);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      stopRaf();
      s.dragging = true;
      s.moved = false;
      s.snapping = false;
      s.axis = e.pointerType === "mouse" ? "x" : "";
      s.vx = 0;
      s.pointerId = e.pointerId;
      s.lastX = e.clientX;
      s.lastT = performance.now();
      s.startX = e.clientX;
      s.startY = e.clientY;
      s.startTranslate = s.x;
      if (e.pointerType === "mouse") {
        viewport.setPointerCapture(e.pointerId);
        setDragMode(true);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!s.dragging || s.pointerId !== e.pointerId) return;

      const dx = e.clientX - s.startX;
      const dy = e.clientY - s.startY;

      if (!s.axis) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        s.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (s.axis === "x") {
          viewport.setPointerCapture(e.pointerId);
          setDragMode(true);
        }
      }

      if (s.axis !== "x") return;

      const now = performance.now();
      const frameDx = e.clientX - s.lastX;
      const dt = Math.max(8, now - s.lastT);
      s.vx = frameDx * (16.67 / dt);
      s.lastX = e.clientX;
      s.lastT = now;
      if (Math.abs(dx) > 4) s.moved = true;
      s.x = clampSlider(s.startTranslate + dx, false);
      applySlider();
      e.preventDefault();
    };

    const endDrag = (e: PointerEvent) => {
      if (s.pointerId !== e.pointerId) return;
      const wasHorizontal = s.axis === "x";
      s.dragging = false;
      s.axis = "";
      setDragMode(false);
      if (viewport.hasPointerCapture(e.pointerId)) {
        viewport.releasePointerCapture(e.pointerId);
      }
      updateScrollButtons();
      if (!wasHorizontal) return;
      if (Math.abs(s.vx) > 0.8) runInertia();
      else snapSlider();
    };

    const onClickCapture = (e: MouseEvent) => {
      if (!s.moved) return;
      e.preventDefault();
      e.stopPropagation();
      s.moved = false;
    };

    const onDragStart = (e: DragEvent) => e.preventDefault();

    let wheelSnapTimer = 0;
    const onWheelSmooth = (e: WheelEvent) => {
      if (track.scrollWidth <= viewport.clientWidth) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta === 0) return;

      // At the last card, release downward scroll to the page.
      // At the first card, release upward scroll to the page.
      const atEnd = s.x <= s.max + 1;
      const atStart = s.x >= s.min - 1;
      if ((delta > 0 && atEnd) || (delta < 0 && atStart)) return;

      e.preventDefault();
      stopRaf();
      s.snapping = false;
      s.vx = 0;
      s.x = clampSlider(s.x - delta, true);
      applySlider();
      updateScrollButtons();
      window.clearTimeout(wheelSnapTimer);
      wheelSnapTimer = window.setTimeout(() => {
        if (!s.dragging) snapSlider();
      }, 80);
    };

    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove, { passive: false });
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    viewport.addEventListener("click", onClickCapture, true);
    viewport.addEventListener("dragstart", onDragStart);
    viewport.addEventListener("wheel", onWheelSmooth, { passive: false });

    return () => {
      stopRaf();
      window.clearTimeout(wheelSnapTimer);
      ro.disconnect();
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", endDrag);
      viewport.removeEventListener("pointercancel", endDrag);
      viewport.removeEventListener("click", onClickCapture, true);
      viewport.removeEventListener("dragstart", onDragStart);
      viewport.removeEventListener("wheel", onWheelSmooth);
    };
  }, [cards]);

  return (
    <section
      ref={sectionRef}
      className={`w-full bg-gradient-to-br from-[#e8f4f8] via-[#f0f0f0] to-[#e8f0f4] py-16 sm:py-20 md:py-24 lg:py-28 transition-all duration-1000 ${isVisible ? "opacity-100" : "opacity-0"
        }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
        {/* Header: title + subheading stacked tight; SEO card in right column */}
        <div
          className={`text-center mb-12 sm:mb-14 md:mb-16 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {/* Desktop XL */}
          <div className="hidden xl:grid xl:grid-cols-[1fr_auto_1fr] xl:gap-x-6 xl:items-start">
            <div aria-hidden />
            <div className="px-2">
              {useFancyHeading ? (
                <h2
                  className={`text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] font-light leading-tight tracking-tight transition-opacity duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}
                  style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}
                >
                  <span className="bg-gradient-to-tr from-[#00E1FF] via-[#0055FF] to-[#FF6B6B] text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(0,180,255,0.2)]">O</span>
                  <span className="text-[#1a1a2e]">ur</span>
                  <span className="text-[#1a1a2e]">&nbsp;</span>
                  <span className="bg-gradient-to-tr from-[#00E1FF] via-[#0055FF] to-[#FF6B6B] text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(0,180,255,0.2)]">S</span>
                  <span className="text-[#1a1a2e]">ervic</span>
                  <span className="bg-gradient-to-tr from-[#0055FF] via-[#FF6B6B] to-[#FF4757] text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(255,107,107,0.2)]">e</span>
                  <span className="text-[#1a1a2e]">s</span>
                </h2>
              ) : (
                <h2
                  className={`text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] font-light leading-tight tracking-tight text-[#1a1a2e] transition-opacity duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}
                  style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}
                >
                  {heading}
                </h2>
              )}
              <h3 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl md:text-3xl font-light text-[#1a1a2e]" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
                {subheading}
              </h3>
              <p className="mt-2 sm:mt-2.5 text-base sm:text-lg md:text-xl text-gray-600" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
                {body}
              </p>
            </div>
            <div className={`flex justify-end items-start transition-all duration-700 delay-150 ${isVisible ? "opacity-100" : "opacity-0"}`}>
              <GoogleRankingPromo />
            </div>
          </div>

          {/* Desktop LG */}
          <div className="hidden lg:block xl:hidden">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-x-4 items-start">
              <div aria-hidden />
              <div>
                {useFancyHeading ? (
                  <h2 className={`text-3xl md:text-5xl lg:text-[3.5rem] font-light leading-tight tracking-tight ${isVisible ? "opacity-100" : "opacity-0"}`} style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
                    <span className="bg-gradient-to-tr from-[#00E1FF] via-[#0055FF] to-[#FF6B6B] text-transparent bg-clip-text">O</span>
                    <span className="text-[#1a1a2e]">ur</span>
                    <span className="text-[#1a1a2e]">&nbsp;</span>
                    <span className="bg-gradient-to-tr from-[#00E1FF] via-[#0055FF] to-[#FF6B6B] text-transparent bg-clip-text">S</span>
                    <span className="text-[#1a1a2e]">ervic</span>
                    <span className="bg-gradient-to-tr from-[#0055FF] via-[#FF6B6B] to-[#FF4757] text-transparent bg-clip-text">e</span>
                    <span className="text-[#1a1a2e]">s</span>
                  </h2>
                ) : (
                  <h2 className={`text-3xl md:text-5xl lg:text-[3.5rem] font-light leading-tight tracking-tight text-[#1a1a2e] ${isVisible ? "opacity-100" : "opacity-0"}`} style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
                    {heading}
                  </h2>
                )}
                <h3 className="mt-1.5 text-2xl md:text-3xl font-light text-[#1a1a2e]" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>{subheading}</h3>
                <p className="mt-2 text-base sm:text-lg text-gray-600" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
                  {body}
                </p>
              </div>
              <div className={`flex justify-end ${isVisible ? "opacity-100" : "opacity-0"}`}>
                <GoogleRankingPromo />
              </div>
            </div>
          </div>

          {/* Mobile & tablet */}
          <div className="lg:hidden">
            {useFancyHeading ? (
              <h2 className={`text-3xl sm:text-4xl md:text-5xl font-light leading-tight tracking-tight ${isVisible ? "opacity-100" : "opacity-0"}`} style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
                <span className="bg-gradient-to-tr from-[#00E1FF] via-[#0055FF] to-[#FF6B6B] text-transparent bg-clip-text">O</span>
                <span className="text-[#1a1a2e]">ur</span>
                <span className="text-[#1a1a2e]">&nbsp;</span>
                <span className="bg-gradient-to-tr from-[#00E1FF] via-[#0055FF] to-[#FF6B6B] text-transparent bg-clip-text">S</span>
                <span className="text-[#1a1a2e]">ervic</span>
                <span className="bg-gradient-to-tr from-[#0055FF] via-[#FF6B6B] to-[#FF4757] text-transparent bg-clip-text">e</span>
                <span className="text-[#1a1a2e]">s</span>
              </h2>
            ) : (
              <h2 className={`text-3xl sm:text-4xl md:text-5xl font-light leading-tight tracking-tight text-[#1a1a2e] ${isVisible ? "opacity-100" : "opacity-0"}`} style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
                {heading}
              </h2>
            )}
            <h3 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-light text-[#1a1a2e]" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>{subheading}</h3>
            <p className="mt-2 text-base sm:text-lg text-gray-600" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
              {body}
            </p>
            <div className={`flex justify-center mt-5 ${isVisible ? "opacity-100" : "opacity-0"}`}>
              <GoogleRankingPromo compact />
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full min-w-0">
        <div
          ref={cardsRef}
          className={`transition-all duration-1000 delay-300 ${cardsVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
            }`}
        >
          <button
            type="button"
            aria-label="Previous services"
            onClick={() => scrollByCard(-1)}
            disabled={!canScrollPrev}
            className="absolute left-2 sm:left-4 top-[calc(50%+8px)] z-20 hidden sm:flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow-[0_8px_24px_rgba(40,30,80,0.16)] transition enabled:hover:bg-white disabled:pointer-events-none disabled:opacity-0"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
              <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next services"
            onClick={() => scrollByCard(1)}
            disabled={!canScrollNext}
            className="absolute right-2 sm:right-4 top-[calc(50%+8px)] z-20 hidden sm:flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow-[0_8px_24px_rgba(40,30,80,0.16)] transition enabled:hover:bg-white disabled:pointer-events-none disabled:opacity-0"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div
            ref={viewportRef}
            className="overflow-hidden cursor-grab pt-4 pb-8 [&.is-dragging_a]:pointer-events-none [&.is-dragging_a]:translate-y-0 [&.is-dragging_a]:transition-none"
            style={{ touchAction: "pan-y" }}
          >
            <div
              ref={trackRef}
              role="region"
              aria-label="Our services"
              className="flex w-max flex-nowrap gap-8 sm:gap-10 lg:gap-12 px-4 sm:px-6 md:px-8 lg:px-10 select-none [backface-visibility:hidden]"
              style={{ willChange: "transform" }}
            >
            {cards.map((card, index) => (
              <Link
                key={`${card.href}-${index}`}
                href={card.href}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                className="group relative isolate flex h-[380px] w-[300px] sm:h-[400px] sm:w-[340px] lg:h-[410px] lg:w-[372px] xl:h-[420px] xl:w-[400px] flex-none flex-col overflow-hidden bg-white shadow-[0_8px_28px_rgba(80,70,140,0.08)] transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(70,50,140,0.28)]"
                style={{ borderRadius: "22px 22px 0 0" }}
              >
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 transition-opacity duration-500 group-hover:opacity-0">
                  <Image
                    src={card.art}
                    alt=""
                    width={900}
                    height={320}
                    sizes="400px"
                    className="h-auto w-full"
                    draggable={false}
                  />
                </div>

                <div className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <Image
                    src="/services/ribbons/card-hover-mesh.webp"
                    alt=""
                    fill
                    sizes="400px"
                    className="object-cover object-center"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#3b2a6a]/55 via-[#4c3a86]/20 to-transparent" />
                </div>

                <div className="relative z-10 flex h-full flex-col px-7 sm:px-8 pt-8 sm:pt-9 pb-8 text-left bg-gradient-to-b from-white via-white/95 to-transparent group-hover:from-transparent group-hover:via-transparent">
                  <h4
                    className="text-[1.5rem] sm:text-[1.7rem] font-medium leading-snug tracking-tight text-black transition-colors duration-500 group-hover:text-white"
                  >
                    {card.title}
                  </h4>
                  <p
                    className="mt-4 text-[15px] sm:text-base leading-[1.7] text-black/90 transition-colors duration-500 group-hover:text-white"
                  >
                    {card.description}
                  </p>
                  <span
                    className="mt-6 inline-flex items-center gap-2 text-[13px] font-bold tracking-[0.08em] uppercase text-black transition-colors duration-500 group-hover:text-white"
                  >
                    Learn More
                    <svg
                      aria-hidden
                      viewBox="0 0 16 16"
                      className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                    >
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
            <div className="w-2 flex-none sm:w-4" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
