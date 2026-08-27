"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  servicesData,
  servicesListingDefaults,
  type ServicesListingDefaults,
  type ServiceData,
} from "@/data/servicesData";

type ListingService = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
};

function listingFromData(): ListingService[] {
  return Object.entries(servicesData).map(([slug, service]) => ({
    slug,
    title: service.title,
    description: service.description,
    icon: service.icon || "code",
    features: (service.features || []).map((f) => f.title).filter(Boolean),
  }));
}

function mergeListingChrome(
  defaults: ServicesListingDefaults,
  page: Record<string, unknown> | null | undefined,
  promo?: {
    heading?: string;
    body?: string;
    ctaLabel?: string;
    ctaHref?: string;
  } | null
): ServicesListingDefaults {
  if (!page && !promo) return defaults;

  const sections =
    page?.sections && typeof page.sections === "object" && !Array.isArray(page.sections)
      ? (page.sections as Record<string, unknown>)
      : {};

  const pick = (...vals: unknown[]) => {
    for (const v of vals) {
      if (typeof v === "string" && v.trim()) return v;
    }
    return undefined;
  };

  const statsRaw = Array.isArray(sections.stats)
    ? sections.stats
    : Array.isArray(page?.stats)
      ? page.stats
      : null;

  const stats =
    statsRaw && statsRaw.length
      ? statsRaw
          .map((s) => {
            const row = s as { value?: string; label?: string };
            return {
              value: String(row?.value || ""),
              label: String(row?.label || ""),
            };
          })
          .filter((s) => s.value || s.label)
      : defaults.stats;

  const whyChooseRaw = Array.isArray(sections.whyChooseItems)
    ? sections.whyChooseItems
    : null;

  const whyChooseItems =
    whyChooseRaw && whyChooseRaw.length
      ? whyChooseRaw
          .map((item) => {
            const row = item as { title?: string; description?: string };
            return {
              title: String(row?.title || ""),
              description: String(row?.description || ""),
            };
          })
          .filter((item) => item.title || item.description)
      : defaults.whyChooseItems;

  return {
    heroEyebrow:
      pick(sections.heroEyebrow, page?.heroEyebrow) || defaults.heroEyebrow,
    heroHeading:
      pick(page?.heroHeading, sections.heroHeading) || defaults.heroHeading,
    heroBody: pick(page?.heroBody, sections.heroBody) || defaults.heroBody,
    learnMoreLabel:
      pick(sections.learnMoreLabel, page?.learnMoreLabel) ||
      defaults.learnMoreLabel,
    whyChooseEyebrow:
      pick(sections.whyChooseEyebrow, page?.whyChooseEyebrow) ||
      defaults.whyChooseEyebrow,
    whyChooseHeading:
      pick(sections.whyChooseHeading, page?.whyChooseHeading) ||
      defaults.whyChooseHeading,
    whyChooseBody:
      pick(sections.whyChooseBody, page?.whyChooseBody) ||
      defaults.whyChooseBody,
    whyChooseItems,
    stats,
    secondaryCtaLabel:
      pick(sections.secondaryCtaLabel, page?.secondaryCtaLabel) ||
      defaults.secondaryCtaLabel,
    ctaHeading:
      pick(promo?.heading, sections.ctaHeading, page?.ctaHeading) ||
      defaults.ctaHeading,
    ctaBody:
      pick(promo?.body, sections.ctaBody, page?.ctaBody) || defaults.ctaBody,
    ctaLabel:
      pick(promo?.ctaLabel, sections.ctaLabel, page?.ctaLabel) ||
      defaults.ctaLabel,
    ctaHref:
      pick(promo?.ctaHref, sections.ctaHref, page?.ctaHref) || defaults.ctaHref,
  };
}

const ServiceIcon = ({ type }: { type: string }) => {
  const icons: { [key: string]: JSX.Element } = {
    code: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
      />
    ),
    mobile: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
      />
    ),
    cloud: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"
      />
    ),
    ai: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
      />
    ),
    devops: (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </>
    ),
    design: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
      />
    ),
    ecommerce: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      />
    ),
    custom: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
      />
    ),
    tax: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
      />
    ),
    marketing: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
      />
    ),
    support: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
      />
    ),
  };

  return (
    <svg
      className="w-8 h-8"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
    >
      {icons[type] || icons.code}
    </svg>
  );
};

function accentLastWord(text: string, accentClass: string) {
  const words = text.trim().split(/\s+/);
  if (words.length <= 1) return <span className={accentClass}>{text}</span>;
  const last = words.pop();
  return (
    <>
      {words.join(" ")} <span className={accentClass}>{last}</span>
    </>
  );
}

export default function ServicesPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [list, setList] = useState<ListingService[]>(listingFromData);
  const [chrome, setChrome] = useState<ServicesListingDefaults>(
    servicesListingDefaults
  );

  useEffect(() => {
    setIsVisible(true);

    Promise.all([
      fetch("/api/cms/services").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/cms/content?type=static-page&slug=services").then((r) =>
        r.ok ? r.json() : null
      ),
      fetch("/api/cms/content?type=promos&slot=services-promo").then((r) =>
        r.ok ? r.json() : null
      ),
      fetch("/api/cms/content?type=page-seo&path=/services").then((r) =>
        r.ok ? r.json() : null
      ),
    ])
      .then(([servicesRes, staticRes, promoRes, seoRes]) => {
        const page = staticRes?.page as Record<string, unknown> | undefined;
        const promo = promoRes?.promos?.[0] as
          | {
              heading?: string;
              body?: string;
              ctaLabel?: string;
              ctaHref?: string;
            }
          | undefined;
        const pageSeo = seoRes?.pageSeo as Record<string, unknown> | undefined;
        const seoH1 = typeof pageSeo?.h1 === "string" ? pageSeo.h1.trim() : "";
        const sections =
          page?.sections && typeof page.sections === "object" && !Array.isArray(page.sections)
            ? (page.sections as Record<string, unknown>)
            : {};
        const cmsHero =
          (typeof page?.heroHeading === "string" && page.heroHeading.trim()) ||
          (typeof sections.heroHeading === "string" && sections.heroHeading.trim()) ||
          "";

        const merged = mergeListingChrome(servicesListingDefaults, page, promo);
        setChrome(
          !cmsHero && seoH1 ? { ...merged, heroHeading: seoH1 } : merged
        );

        const cmsServices = servicesRes?.services as
          | (Partial<ServiceData> & { slug?: string })[]
          | undefined;
        if (!cmsServices?.length) return;

        const fallbackBySlug = new Map(
          Object.entries(servicesData).map(([slug, data]) => [slug, data])
        );

        setList(
          cmsServices
            .map((s) => {
              const slug = String(s.slug || "");
              const fallback = fallbackBySlug.get(slug);
              const features = Array.isArray(s.features)
                ? s.features
                    .map((f) =>
                      typeof f === "string"
                        ? f
                        : String((f as { title?: string })?.title || "")
                    )
                    .filter(Boolean)
                : (fallback?.features || []).map((f) => f.title);

              return {
                slug,
                title: String(s.title || fallback?.title || ""),
                description: String(
                  s.description || fallback?.description || ""
                ),
                icon: String(s.icon || fallback?.icon || "code"),
                features: features.length
                  ? features
                  : (fallback?.features || []).map((f) => f.title),
              };
            })
            .filter((s) => s.slug)
        );
      })
      .catch(() => {});
  }, []);

  const promoHeadingParts = (() => {
    const trimmed = chrome.ctaHeading.trim();
    const lastSpace = trimmed.lastIndexOf(" ");
    if (lastSpace <= 0) return { lead: trimmed, accent: "" };
    return {
      lead: trimmed.slice(0, lastSpace),
      accent: trimmed.slice(lastSpace + 1),
    };
  })();

  const whyChooseAccentClass =
    "bg-gradient-to-r from-[#0055FF] via-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />

          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-[#00B4FF]/20 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-20 right-10 w-96 h-96 bg-[#00B4FF]/10 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#0055FF]/10 rounded-full blur-3xl" />
          </div>

          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: "60px 60px",
              }}
            />
          </div>

          <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 pt-32 pb-20 text-center">
            <div
              className={`transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="flex items-center justify-center gap-2 text-white/60 text-sm mb-8">
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <span>/</span>
                <span className="bg-gradient-to-r from-[#0055FF] via-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">
                  Services
                </span>
              </div>

              <span className="inline-block px-4 py-2 bg-[#00B4FF]/20 border border-[#00B4FF]/30 rounded-full text-[#00E1FF] text-sm font-medium mb-6">
                {chrome.heroEyebrow}
              </span>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                {accentLastWord(
                  chrome.heroHeading,
                  "bg-gradient-to-r from-[#0055FF] via-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text"
                )}
              </h1>

              <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto">
                {chrome.heroBody}
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {list.map((service, index) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className={`group relative p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:border-[#00B4FF]/30 transition-all duration-500 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="w-16 h-16 bg-[#00B4FF]/10 rounded-xl flex items-center justify-center text-[#00B4FF] mb-6 group-hover:bg-gradient-to-r group-hover:from-[#0055FF] group-hover:via-[#00B4FF] group-hover:to-[#00E1FF] group-hover:text-white transition-all duration-300">
                    <ServiceIcon type={service.icon} />
                  </div>

                  <h3 className="text-xl font-semibold text-[#1a1a2e] mb-3 group-hover:text-[#00B4FF] transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-gray-600 mb-6 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {service.features.slice(0, 3).map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-[#00B4FF]/10 text-[#0055FF] text-xs rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-[#00B4FF] font-medium">
                    <span>{chrome.learnMoreLabel}</span>
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 ${
                        hoveredIndex === index ? "translate-x-2" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </div>

                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00B4FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-[#f8f9fa]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="inline-block px-4 py-2 bg-[#00B4FF]/10 rounded-full text-[#00B4FF] text-sm font-medium mb-4">
                  {chrome.whyChooseEyebrow}
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a2e] mb-6">
                  {accentLastWord(chrome.whyChooseHeading, whyChooseAccentClass)}
                </h2>
                <p className="text-gray-600 text-lg mb-8">{chrome.whyChooseBody}</p>

                <div className="space-y-6">
                  {chrome.whyChooseItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-[#0055FF] to-[#00B4FF] flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#1a1a2e]">
                          {item.title}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {chrome.stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white p-8 rounded-2xl shadow-lg text-center"
                  >
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#0055FF] via-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text mb-2">
                      {stat.value}
                    </div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                {promoHeadingParts.accent ? (
                  <>
                    {promoHeadingParts.lead}{" "}
                    <span className="bg-gradient-to-r from-[#0055FF] via-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">
                      {promoHeadingParts.accent}
                    </span>
                  </>
                ) : (
                  chrome.ctaHeading
                )}
              </h2>
              <p className="text-white/70 text-lg mb-10">{chrome.ctaBody}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={chrome.ctaHref || "/lets-talk-business"}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0055FF] via-[#00B4FF] to-[#00E1FF] hover:opacity-90 text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#00B4FF]/30"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  {chrome.ctaLabel}
                </Link>
                <Link
                  href={chrome.ctaHref || "/lets-talk-business"}
                  className="inline-flex items-center justify-center gap-2 border border-white/30 hover:border-white/50 text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 hover:bg-white/5"
                >
                  {chrome.secondaryCtaLabel}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
