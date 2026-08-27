"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface JobPosition {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salary: string | null;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  isActive: boolean;
  createdAt: string;
}

type CareersChrome = {
  openingsEyebrow: string;
  openingsHeading: string;
  emptyHeading: string;
  emptyBody: string;
  emptyEmail: string;
  whyEyebrow: string;
  whyHeading: string;
  whyCards: { title: string; description: string }[];
  ctaHeading: string;
  ctaBody: string;
  ctaLabel: string;
  ctaHref: string;
  applyLabel: string;
};

const EMPTY_CHROME: CareersChrome = {
  openingsEyebrow: "",
  openingsHeading: "",
  emptyHeading: "",
  emptyBody: "",
  emptyEmail: "",
  whyEyebrow: "",
  whyHeading: "",
  whyCards: [],
  ctaHeading: "",
  ctaBody: "",
  ctaLabel: "",
  ctaHref: "",
  applyLabel: "",
};

export default function CareersPage() {
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState<JobPosition | null>(null);
  const [heroHeading, setHeroHeading] = useState("");
  const [heroBody, setHeroBody] = useState("");
  const [chrome, setChrome] = useState<CareersChrome>(EMPTY_CHROME);

  useEffect(() => {
    fetchPositions();
    let cancelled = false;
    Promise.all([
      fetch("/api/cms/content?type=static-page&slug=careers").then((r) =>
        r.ok ? r.json() : null
      ),
      fetch("/api/cms/content?type=page-seo&path=/careers").then((r) =>
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

        const sections =
          page?.sections && typeof page.sections === "object" && !Array.isArray(page.sections)
            ? (page.sections as Record<string, unknown>)
            : {};

        const whyCardsRaw = Array.isArray(sections.whyCards) ? sections.whyCards : [];
        const whyCards = whyCardsRaw
          .map((card) => {
            const row = card as { title?: string; description?: string };
            return {
              title: String(row?.title || ""),
              description: String(row?.description || ""),
            };
          })
          .filter((c) => c.title || c.description);

        setChrome({
          openingsEyebrow: String(sections.openingsEyebrow || ""),
          openingsHeading: String(sections.openingsHeading || ""),
          emptyHeading: String(sections.emptyHeading || ""),
          emptyBody: String(sections.emptyBody || ""),
          emptyEmail: String(sections.emptyEmail || ""),
          whyEyebrow: String(sections.whyEyebrow || ""),
          whyHeading: String(sections.whyHeading || ""),
          whyCards,
          ctaHeading: String(sections.ctaHeading || ""),
          ctaBody: String(sections.ctaBody || ""),
          ctaLabel: String(sections.ctaLabel || ""),
          ctaHref: String(sections.ctaHref || ""),
          applyLabel: String(sections.applyLabel || ""),
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchPositions = async () => {
    try {
      const cmsRes = await fetch("/api/cms/content?type=jobs");
      if (cmsRes.ok) {
        const cms = await cmsRes.json();
        if (cms.jobs?.length) {
          setPositions(
            cms.jobs.map((j: Record<string, unknown>, idx: number) => ({
              id: String(j.documentId || j.id || idx),
              title: String(j.title || ""),
              department: String(j.department || ""),
              location: String(j.location || ""),
              type: String(j.type || "Full-time"),
              experience: String(j.experience || ""),
              salary: (j.salary as string) || null,
              description: String(j.description || ""),
              requirements: Array.isArray(j.requirements) ? j.requirements : [],
              responsibilities: Array.isArray(j.responsibilities) ? j.responsibilities : [],
              benefits: Array.isArray(j.benefits) ? j.benefits : [],
              isActive: j.isActive !== false,
              createdAt: String(j.createdAt || new Date().toISOString()),
            }))
          );
          setLoading(false);
          return;
        }
      }

      const response = await fetch("/api/careers");
      if (response.ok) {
        const data = await response.json();
        setPositions(data.positions || []);
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
    } finally {
      setLoading(false);
    }
  };

  const emptyMailto = chrome.emptyEmail
    ? `mailto:${chrome.emptyEmail}`
    : chrome.ctaHref || "#";
  const applyMailto = (title: string) =>
    chrome.emptyEmail
      ? `mailto:${chrome.emptyEmail}?subject=Application for ${encodeURIComponent(title)}`
      : chrome.ctaHref || "#";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <section className="relative bg-[#1a1a2e] pt-28 pb-16 overflow-hidden">
          <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 text-white/50 text-sm mb-8">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <span className="text-white">Careers</span>
            </div>

            <div className="max-w-3xl">
              {heroHeading ? (
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  {heroHeading}
                </h1>
              ) : null}
              {heroBody ? <p className="text-white/70 leading-relaxed">{heroBody}</p> : null}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            {(chrome.openingsEyebrow || chrome.openingsHeading) && (
              <div className="mb-10">
                {chrome.openingsEyebrow ? (
                  <span className="inline-block bg-[#262b3f]/10 text-[#262b3f] text-sm font-semibold px-4 py-2 rounded-full mb-4">
                    {chrome.openingsEyebrow}
                  </span>
                ) : null}
                {chrome.openingsHeading ? (
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">{chrome.openingsHeading}</h2>
                ) : null}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#0055FF]/20 border-t-[#0055FF] rounded-full animate-spin"></div>
              </div>
            ) : positions.length === 0 ? (
              (chrome.emptyHeading || chrome.emptyBody || chrome.emptyEmail) && (
                <div className="max-w-2xl">
                  <div className="bg-[#f8f9fa] rounded-xl p-8">
                    {chrome.emptyHeading ? (
                      <h3 className="text-xl font-semibold text-[#1a1a2e] mb-3">{chrome.emptyHeading}</h3>
                    ) : null}
                    {chrome.emptyBody ? (
                      <p className="text-gray-600 mb-6">{chrome.emptyBody}</p>
                    ) : null}
                    {chrome.emptyEmail || chrome.ctaLabel ? (
                      <a
                        href={emptyMailto}
                        className="inline-flex items-center gap-2 bg-[#262b3f] hover:bg-[#0055FF] text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-300"
                      >
                        {chrome.ctaLabel || "Send Resume"}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </a>
                    ) : null}
                  </div>
                </div>
              )
            ) : (
              <div className="grid gap-4 max-w-4xl">
                {positions.map((position) => (
                  <div
                    key={position.id}
                    onClick={() => setSelectedPosition(position)}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#0055FF]/30 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[#1a1a2e] group-hover:text-[#0055FF] transition-colors">
                          {position.title}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">{position.department}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {position.location}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {position.type}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {position.experience}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#0055FF] text-sm font-medium group-hover:translate-x-1 transition-transform">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {(chrome.whyEyebrow || chrome.whyHeading || chrome.whyCards.length > 0) && (
          <section className="py-16 bg-[#f8f9fa]">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
              <div className="mb-10">
                {chrome.whyEyebrow ? (
                  <span className="inline-block bg-[#262b3f]/10 text-[#262b3f] text-sm font-semibold px-4 py-2 rounded-full mb-4">
                    {chrome.whyEyebrow}
                  </span>
                ) : null}
                {chrome.whyHeading ? (
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">{chrome.whyHeading}</h2>
                ) : null}
              </div>

              {chrome.whyCards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {chrome.whyCards.map((card, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl p-6 border border-transparent hover:border-[#262b3f]/20 transition-all"
                    >
                      {card.title ? (
                        <h3 className="text-lg font-semibold text-[#1a1a2e] mb-2">{card.title}</h3>
                      ) : null}
                      {card.description ? (
                        <p className="text-gray-600 text-sm">{card.description}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        )}

        {(chrome.ctaHeading || chrome.ctaBody || chrome.ctaLabel) && (
          <section className="py-10 bg-[#1a1a2e]">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gradient-to-r from-[#262b3f]/20 to-transparent rounded-2xl p-6 md:p-8">
                <div>
                  {chrome.ctaHeading ? (
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{chrome.ctaHeading}</h2>
                  ) : null}
                  {chrome.ctaBody ? (
                    <p className="text-white/70 text-sm">{chrome.ctaBody}</p>
                  ) : null}
                </div>
                {chrome.ctaLabel ? (
                  <a
                    href={chrome.ctaHref || emptyMailto}
                    className="inline-flex items-center justify-center gap-2 bg-[#262b3f] hover:bg-[#0055FF] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 whitespace-nowrap"
                  >
                    {chrome.ctaLabel}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                ) : null}
              </div>
            </div>
          </section>
        )}
      </main>

      {selectedPosition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPosition(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#1a1a2e]">{selectedPosition.title}</h2>
                  <p className="text-gray-500 mt-1">{selectedPosition.department}</p>
                </div>
                <button onClick={() => setSelectedPosition(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                  <strong>Location:</strong> {selectedPosition.location}
                </span>
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                  <strong>Type:</strong> {selectedPosition.type}
                </span>
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                  <strong>Experience:</strong> {selectedPosition.experience}
                </span>
                {selectedPosition.salary && (
                  <span className="text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                    <strong>Salary:</strong> {selectedPosition.salary}
                  </span>
                )}
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-[#1a1a2e] uppercase tracking-wider mb-3">About the Role</h3>
                <p className="text-gray-600 leading-relaxed">{selectedPosition.description}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <a
                href={applyMailto(selectedPosition.title)}
                className="w-full flex items-center justify-center gap-2 bg-[#0055FF] hover:bg-[#0044CC] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
              >
                {chrome.applyLabel || "Apply Now"}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
