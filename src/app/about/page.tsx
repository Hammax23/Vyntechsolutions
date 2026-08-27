"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TechnologyImpact from "@/components/TechnologyImpact";
import CmsHtml from "@/components/CmsHtml";

type AboutSections = {
  missionEyebrow?: string;
  missionHeading?: string;
  missionBody?: string;
  missionBody2?: string;
  heroCtaLabel?: string;
  missionCtaLabel?: string;
  missionStats?: { title?: string; label?: string; value?: string }[];
  valuesEyebrow?: string;
  valuesHeading?: string;
  values?: { title: string; description: string }[];
  processEyebrow?: string;
  processHeading?: string;
  processIntro?: string;
  process?: { number?: string; title: string; description: string }[];
  ctaHeading?: string;
  ctaBody?: string;
  ctaButtonLabel?: string;
  ctaEmail?: string;
  [key: string]: unknown;
};

const VALUE_VISUALS: { icon: ReactNode; gradient: string }[] = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    gradient: "from-orange-500 to-red-500",
  },
];

function valueVisual(index: number) {
  return VALUE_VISUALS[index % VALUE_VISUALS.length];
}

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [heroHeading, setHeroHeading] = useState("");
  const [heroBody, setHeroBody] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [bodyHtml, setBodyHtml] = useState<string | null>(null);
  const [sections, setSections] = useState<AboutSections | null>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsVisible(true);
    let cancelled = false;
    Promise.all([
      fetch("/api/cms/content?type=static-page&slug=about").then((r) =>
        r.ok ? r.json() : null
      ),
      fetch("/api/cms/content?type=page-seo&path=/about").then((r) =>
        r.ok ? r.json() : null
      ),
    ])
      .then(([data, seoRes]) => {
        if (cancelled) return;
        const page = data?.page as Record<string, unknown> | undefined;
        const pageSeo = seoRes?.pageSeo as Record<string, unknown> | undefined;
        const seoH1 = typeof pageSeo?.h1 === "string" ? pageSeo.h1.trim() : "";

        if (page?.heroHeading) setHeroHeading(String(page.heroHeading));
        else if (seoH1) setHeroHeading(seoH1);

        if (page?.heroBody) setHeroBody(String(page.heroBody));

        const heroImg = (page?.heroimage as any) || (page?.heroImage as any);
        let parsedUrl = "";
        if (heroImg?.url) {
          parsedUrl = String(heroImg.url);
        } else if (heroImg?.data?.attributes?.url) {
          parsedUrl = String(heroImg.data.attributes.url);
        } else if (heroImg?.data?.url) {
          parsedUrl = String(heroImg.data.url);
        }

        if (parsedUrl) {
          if (parsedUrl.startsWith("/")) {
            parsedUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337"}${parsedUrl}`;
          }
          setHeroImageUrl(parsedUrl);
        }

        const body = page?.body != null ? String(page.body).trim() : "";
        if (body) setBodyHtml(body);
        if (page?.sections && typeof page.sections === "object" && !Array.isArray(page.sections)) {
          setSections(page.sections as AboutSections);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const renderHeroHeading = () => {
    if (!heroHeading) return null;

    if (heroHeading.includes("\n")) {
      const [first, ...rest] = heroHeading.split("\n");
      const restText = rest.join("\n");
      const words = restText.split(" ");
      if (words.length > 0) {
        const lastWord = words.pop();
        return (
          <>
            {first}
            <span className="block mt-2">
              {words.join(" ")}{" "}
              <span className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">{lastWord}</span>
            </span>
          </>
        );
      }
      return (
        <>
          {first}
          <span className="block mt-2 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">{restText}</span>
        </>
      );
    }
    const words = heroHeading.split(" ");
    if (words.length > 1) {
      const lastWord = words.pop();
      return (
        <>
          {words.join(" ")}{" "}
          <span className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">{lastWord}</span>
        </>
      );
    }
    return <span className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">{heroHeading}</span>;
  };

  const missionStats = Array.isArray(sections?.missionStats) ? sections!.missionStats! : [];
  const valuesList = Array.isArray(sections?.values) ? sections!.values! : [];
  const processList = Array.isArray(sections?.process) ? sections!.process! : [];
  const ctaHeading = sections?.ctaHeading?.trim() || "";
  const ctaBody = sections?.ctaBody?.trim() || "";
  const ctaButtonLabel = sections?.ctaButtonLabel?.trim() || "";
  const ctaEmail = sections?.ctaEmail?.trim() || "";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <section ref={heroRef} className="relative bg-[#0a0a14] pt-32 pb-24 overflow-hidden">
          <div className="absolute inset-0">
            {heroImageUrl && (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
                  style={{ backgroundImage: `url(${heroImageUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-[#0a0a14]/60 to-[#0a0a14]/80" />
              </>
            )}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00E1FF]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0055FF]/10 rounded-full blur-3xl" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
          </div>

          <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className={`flex items-center gap-2 text-white/40 text-sm mb-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-white/70">About</span>
            </div>

            <div className="max-w-3xl">
              <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                {heroHeading ? (
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1]">
                    {renderHeroHeading()}
                  </h1>
                ) : null}

                {heroBody ? (
                  <p className="text-lg text-white/60 mb-8 leading-relaxed">{heroBody}</p>
                ) : null}

                {sections?.heroCtaLabel ? (
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent("openLetsTalkBusiness"))}
                    className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-[#0055FF]/25 hover:opacity-90 transition-all"
                  >
                    {sections.heroCtaLabel}
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {bodyHtml ? (
          <section className="py-24 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
              <div className="bg-[#0a0a14] rounded-2xl p-8 sm:p-10 text-white/80">
                <CmsHtml html={bodyHtml} />
              </div>
            </div>
          </section>
        ) : (
          <>
            {(sections?.missionHeading || sections?.missionBody || missionStats.length > 0) && (
              <section className="py-24 bg-gradient-to-b from-white to-gray-50">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
                  <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                      {sections?.missionEyebrow ? (
                        <span className="inline-block text-sm font-semibold bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text tracking-wider uppercase mb-4">
                          {sections.missionEyebrow}
                        </span>
                      ) : null}
                      {sections?.missionHeading ? (
                        <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e] mb-6 leading-tight">
                          {(() => {
                            const heading = sections.missionHeading;
                            const words = heading.split(" ");
                            if (words.length > 2) {
                              const lastTwo = words.splice(-2).join(" ");
                              return (
                                <>
                                  {words.join(" ")}{" "}
                                  <span className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text inline-block">{lastTwo}</span>
                                </>
                              );
                            }
                            return heading;
                          })()}
                        </h2>
                      ) : null}
                      {sections?.missionBody ? (
                        <p className="text-gray-600 text-lg leading-relaxed mb-6">{sections.missionBody}</p>
                      ) : null}
                      {sections?.missionBody2 ? (
                        <p className="text-gray-600 leading-relaxed mb-10">{sections.missionBody2}</p>
                      ) : null}
                      {sections?.missionCtaLabel ? (
                        <button
                          onClick={() => window.dispatchEvent(new CustomEvent("openLetsTalkBusiness"))}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-white px-8 py-3.5 rounded-full font-semibold hover:opacity-90 transition-all shadow-lg shadow-[#0055FF]/25"
                        >
                          {sections.missionCtaLabel}
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </button>
                      ) : null}
                    </div>

                    {missionStats.length > 0 ? (
                      <div className="flex flex-col gap-4 relative z-10">
                        {missionStats.map((stat, i) => {
                          const title = String(stat.title || "");
                          const label = String(stat.label || "");
                          const value = String(stat.value || "");
                          return (
                            <div
                              key={i}
                              className="flex items-center gap-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1)] transition-shadow cursor-default"
                            >
                              {value ? (
                                <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-xl flex items-center justify-center text-2xl border border-gray-100">
                                  {value}
                                </div>
                              ) : null}
                              <div>
                                {title ? <h4 className="font-bold text-[#1a1a2e] text-base mb-1">{title}</h4> : null}
                                {label ? <p className="text-gray-500 text-sm">{label}</p> : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>
            )}

            {(sections?.valuesEyebrow || sections?.valuesHeading || valuesList.length > 0) && (
              <section className="py-24 bg-[#0a0a14]">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
                  <div className="text-center mb-16">
                    {sections?.valuesEyebrow ? (
                      <span className="inline-block text-sm font-semibold bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text tracking-widest uppercase mb-4">
                        {sections.valuesEyebrow}
                      </span>
                    ) : null}
                    {sections?.valuesHeading ? (
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                        {sections.valuesHeading}
                      </h2>
                    ) : null}
                  </div>

                  {valuesList.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {valuesList.map((value, index) => {
                        const visual = valueVisual(index);
                        return (
                          <div
                            key={index}
                            className="bg-[#1a1a2e] rounded-2xl p-8 border border-white/5 hover:border-white/10 transition-all duration-300"
                          >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00E1FF]/10 to-[#0055FF]/10 text-[#00E1FF] flex items-center justify-center mb-6">
                              {visual.icon}
                            </div>
                            <h3 className="text-xl font-bold bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text mb-3">
                              {value.title}
                            </h3>
                            <p className="text-white/60 text-sm leading-relaxed">{value.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </section>
            )}

            {(sections?.processEyebrow || sections?.processHeading || processList.length > 0) && (
              <section className="py-24 bg-white">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
                  <div className="text-center mb-16">
                    {sections?.processEyebrow ? (
                      <span className="inline-block text-sm font-semibold bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text tracking-wider uppercase mb-4">
                        {sections.processEyebrow}
                      </span>
                    ) : null}
                    {sections?.processHeading ? (
                      <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e] mb-4">
                        {sections.processHeading}
                      </h2>
                    ) : null}
                    {sections?.processIntro ? (
                      <p className="text-gray-600 max-w-2xl mx-auto">{sections.processIntro}</p>
                    ) : null}
                  </div>

                  {processList.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {processList.map((step, index, arr) => (
                        <div key={index} className="relative">
                          {index < arr.length - 1 && (
                            <div className="hidden lg:block absolute top-8 left-full w-full h-[2px] bg-gradient-to-r from-[#00E1FF]/30 to-transparent -translate-x-4" />
                          )}
                          <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100">
                            <div className="text-5xl font-bold bg-gradient-to-br from-[#00E1FF] to-[#0055FF] bg-clip-text text-transparent mb-4">
                              {step.number || String(index + 1).padStart(2, "0")}
                            </div>
                            <h3 className="text-lg font-semibold text-[#1a1a2e] mb-2">{step.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </section>
            )}
          </>
        )}

        <TechnologyImpact />

        {(ctaHeading || ctaBody || ctaButtonLabel || ctaEmail) && (
          <section className="py-24 bg-[#0a0a14] relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#00E1FF]/20 to-[#0055FF]/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6">
              <div className="text-center max-w-3xl mx-auto">
                {ctaHeading ? (
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                    {(() => {
                      const words = ctaHeading.split(" ");
                      if (words.length > 1) {
                        const last = words.pop();
                        return (
                          <>
                            {words.join(" ")}
                            <span className="block bg-gradient-to-r from-[#00E1FF] to-[#0055FF] bg-clip-text text-transparent">
                              {last}
                            </span>
                          </>
                        );
                      }
                      return ctaHeading;
                    })()}
                  </h2>
                ) : null}
                {ctaBody ? <p className="text-white/60 text-lg mb-10">{ctaBody}</p> : null}
                {(ctaButtonLabel || ctaEmail) && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {ctaButtonLabel ? (
                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent("openLetsTalkBusiness"))}
                        className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-[#0055FF]/25"
                      >
                        {ctaButtonLabel}
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    ) : null}
                    {ctaEmail ? (
                      <a
                        href={`mailto:${ctaEmail}`}
                        className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        Email Us
                      </a>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
