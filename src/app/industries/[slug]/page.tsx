"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { industriesData, type IndustryData } from "@/data/industriesData";

// Industries Data
export default function IndustryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [industry, setIndustry] = useState<IndustryData | null>(industriesData[slug] || null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/cms/industries/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.industry) setIndustry(data.industry);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!industry) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#1a1a2e] mb-4">Industry Not Found</h1>
            <Link href="/industries" className="text-[#1a1a2e] hover:underline">
              View All Industries
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section - Minimal */}
        <section className="relative bg-[#1a1a2e] pt-28 pb-16 overflow-hidden">
          <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/50 text-sm mb-8">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <Link href="/industries" className="hover:text-white transition-colors">Industries</Link>
              <span>›</span>
              <span className="text-white">{industry.title}</span>
            </div>

            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {industry.title}
              </h1>
              <p className="text-white/70 mb-6 leading-relaxed">
                {industry.description}
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                  className="inline-flex items-center gap-2 border border-white text-white hover:bg-[#262b3f] hover:border-[#262b3f] px-6 py-3 rounded-lg font-medium transition-all duration-300"
                >
                  Build Your Project Now
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
                <div className="flex items-center gap-6 text-white/60 text-sm">
                  {industry.heroStats.slice(0, 3).map((stat, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-white font-semibold">{stat.value}</span>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Section - Combined */}
        <section className="py-16 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="mb-12">
              <span className="inline-block bg-[#262b3f]/10 text-[#262b3f] text-sm font-semibold px-4 py-2 rounded-full mb-4">What We Deliver</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">
                {industry.subtitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {industry.services.map((service, index) => (
                <div
                  key={index}
                  className="bg-[#f8f9fa] rounded-xl p-6 hover:shadow-lg transition-all duration-300 group border border-transparent hover:border-[#262b3f]/20"
                >
                  <h3 className="text-lg font-semibold text-[#1a1a2e] mb-2 group-hover:text-[#262b3f] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Slim */}
        <section id="contact" className="py-10 bg-[#1a1a2e]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gradient-to-r from-[#262b3f]/20 to-transparent rounded-2xl p-6 md:p-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Ready To Get Started?
                </h2>
                <p className="text-white/70 text-sm">
                  Let&apos;s discuss how our {industry.title.split(' ')[0].toLowerCase()} services can help transform your business.
                </p>
              </div>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                className="inline-flex items-center justify-center gap-2 bg-[#262b3f] hover:bg-[#0055FF] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 whitespace-nowrap"
              >
                Transform Your Digital Presence
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
