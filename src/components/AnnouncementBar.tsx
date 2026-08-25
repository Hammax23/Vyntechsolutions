"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Promo = {
  heading?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  active?: boolean;
};

const FALLBACK: Promo = {
  heading: "SEO Packages",
  body: "From $799/mo",
  ctaLabel: "View Packages",
  ctaHref: "/services/seo-digital-marketing#packages",
};

export default function AnnouncementBar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [promo, setPromo] = useState<Promo | null>(null);

  const hideWidgets =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/quote") ||
    pathname?.startsWith("/verify");

  useEffect(() => {
    if (hideWidgets) return;
    const dismissed = sessionStorage.getItem("announcementDismissed");
    if (dismissed) return;

    let cancelled = false;
    fetch("/api/cms/content?type=promos&slot=announcement-bar")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        const list = (data?.promos || []) as Promo[];
        const active = list.find((p) => p.active !== false) || list[0];
        if (!active && !FALLBACK.heading) return;
        setPromo(active || FALLBACK);
        setIsVisible(true);
        setTimeout(() => setIsAnimating(true), 100);
      })
      .catch(() => {
        if (cancelled) return;
        setPromo(FALLBACK);
        setIsVisible(true);
        setTimeout(() => setIsAnimating(true), 100);
      });

    return () => {
      cancelled = true;
    };
  }, [hideWidgets]);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("announcementDismissed", "true");
    }, 300);
  };

  if (hideWidgets || !isVisible || !promo) return null;

  const href = promo.ctaHref || FALLBACK.ctaHref!;
  const label = promo.ctaLabel || FALLBACK.ctaLabel!;
  const heading = promo.heading || FALLBACK.heading!;
  const body = promo.body || FALLBACK.body!;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-[#0055FF] via-[#00B4FF] to-[#0055FF] transform transition-all duration-300 ${
        isAnimating ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 py-2.5 flex items-center justify-center gap-4 relative">
        <div className="flex items-center gap-2 sm:gap-4 text-white text-sm sm:text-base">
          <span className="hidden sm:inline-block bg-white/20 px-2 py-0.5 rounded text-xs font-bold">
            LIMITED OFFER
          </span>
          <span className="font-medium text-center">
            <span className="font-bold">{heading}</span>
            {body ? (
              <>
                {" "}
                <span className="hidden md:inline">{body}</span>
              </>
            ) : null}
          </span>
          <Link
            href={href}
            className="bg-white text-[#0055FF] px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-white/90 transition-all duration-300 hover:scale-105 whitespace-nowrap"
          >
            {label}
          </Link>
        </div>

        <button
          onClick={handleDismiss}
          className="absolute right-2 sm:right-4 text-white/80 hover:text-white transition-colors p-1"
          aria-label="Dismiss announcement"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
