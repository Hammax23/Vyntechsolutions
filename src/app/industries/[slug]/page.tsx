"use client";

import Link from "next/link";
import Image from "next/image";
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
      .catch(() => { });
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
            <h1 className="text-4xl font-bold text-[#0f172a] mb-4">Industry Not Found</h1>
            <Link href="/industries" className="text-[#0f172a] hover:underline">
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
        <section className="relative bg-[#0f172a] pt-28 pb-16 overflow-hidden min-h-[500px] flex items-center">
          {industry.heroImage && (
            <>
              <Image
                src={industry.heroImage.startsWith('http') ? industry.heroImage : `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${industry.heroImage}`}
                alt={industry.title}
                fill
                className="object-cover z-0"
                unoptimized
              />
              <div className="absolute inset-0 bg-[#0f172a]/80 z-0" />
            </>
          )}
          <div className="relative z-10 max-w-[1400px] w-full mx-auto px-4 sm:px-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/50 text-sm mb-8">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <Link href="/industries" className="hover:text-white transition-colors">Industries</Link>
              <span>›</span>
              <span className="text-white">{industry.title}</span>
            </div>

            <div className="max-w-3xl">
              {/* Left: Text Content */}
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  {(() => {
                    const words = industry.title.split(' ');
                    const lastWord = words.pop();
                    return (
                      <>
                        {words.join(' ')}{' '}
                        <span className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">
                          {lastWord}
                        </span>
                      </>
                    );
                  })()}
                </h1>
                <p className="text-white/70 mb-6 leading-relaxed">
                  {industry.description}
                </p>
                <div className="flex flex-wrap items-center gap-6">
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                    className="inline-flex items-center gap-2 border border-white text-white hover:bg-gradient-to-r hover:from-[#00E1FF] hover:to-[#0055FF] hover:border-transparent px-6 py-3 rounded-lg font-medium transition-all duration-300"
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
            </div>
        </section>

        {/* Solutions Section - Combined */}
        <section className="py-16 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="mb-12">
              <span className="inline-block bg-[#00E1FF]/10 text-[#0055FF] text-sm font-semibold px-4 py-2 rounded-full mb-4">What We Deliver</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a]">
                {(() => {
                  const words = industry.subtitle.split(' ');
                  const lastWord = words.pop();
                  return (
                    <>
                      {words.join(' ')}{' '}
                      <span className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">
                        {lastWord}
                      </span>
                    </>
                  );
                })()}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {industry.services.map((service, index) => (
                <div
                  key={index}
                  className="bg-[#f8f9fa] rounded-xl p-6 hover:shadow-lg transition-all duration-300 group border border-transparent hover:border-[#00E1FF]/40"
                >
                  <h3 className="text-lg font-semibold text-[#0f172a] mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#00E1FF] group-hover:to-[#0055FF] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 bg-[#f8fafc]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Heading + Text */}
              <div className="lg:col-span-5">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] mb-4">
                  Why <span className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">choose us</span>
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] rounded-full mb-8" />

                <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
                  As you know, digital solutions are the core concept of online businesses today. Either driving qualified traffic or building scalable software, digital strategy is essential for your enterprise to grow revenue and stay competitive. VynTech Solutions is a premier web design and software development agency delivering reliable, high-performance services.
                </p>

                <h3 className="text-base sm:text-lg font-bold text-[#0f172a] mb-2">
                  Imaginations into creativity
                </h3>

                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  As a dedicated software and web development company, we have worked on websites and web applications with incredible clients for diverse industries. It has enabled us to stretch our imaginations into a new realm of creativity and apply technical skills to enhance user experience. Finally, it has resulted in delivering perfect, bespoke solutions that aptly represent the goals of our clients.
                </p>
              </div>

              {/* Right Column: 6 White Cards Grid (2 cols on mobile) */}
              <div className="lg:col-span-7">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-5">
                  {/* Card 1 */}
                  <div className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:border-[#00E1FF]/40 transition-all duration-300 min-h-[130px] sm:min-h-[160px] border border-gray-100 group">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#0f172a] group-hover:text-[#00E1FF] transition-colors mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                    <span className="text-[#0f172a] font-semibold text-[11px] sm:text-xs md:text-sm leading-snug">Result Driven<br />Approach</span>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:border-[#00E1FF]/40 transition-all duration-300 min-h-[130px] sm:min-h-[160px] border border-gray-100 group">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#0f172a] group-hover:text-[#00E1FF] transition-colors mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0h-18" />
                    </svg>
                    <span className="text-[#0f172a] font-semibold text-[11px] sm:text-xs md:text-sm leading-snug">Digital First<br />Strategies</span>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:border-[#00E1FF]/40 transition-all duration-300 min-h-[130px] sm:min-h-[160px] border border-gray-100 group">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#0f172a] group-hover:text-[#00E1FF] transition-colors mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                    <span className="text-[#0f172a] font-semibold text-[11px] sm:text-xs md:text-sm leading-snug">Team of Experienced<br />Professionals</span>
                  </div>

                  {/* Card 4 */}
                  <div className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:border-[#00E1FF]/40 transition-all duration-300 min-h-[130px] sm:min-h-[160px] border border-gray-100 group">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#0f172a] group-hover:text-[#00E1FF] transition-colors mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-[#0f172a] font-semibold text-[11px] sm:text-xs md:text-sm leading-snug">On Time Delivery</span>
                  </div>

                  {/* Card 5 */}
                  <div className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:border-[#00E1FF]/40 transition-all duration-300 min-h-[130px] sm:min-h-[160px] border border-gray-100 group">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#0f172a] group-hover:text-[#00E1FF] transition-colors mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                    <span className="text-[#0f172a] font-semibold text-[11px] sm:text-xs md:text-sm leading-snug">No False<br />Commitments</span>
                  </div>

                  {/* Card 6 */}
                  <div className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:border-[#00E1FF]/40 transition-all duration-300 min-h-[130px] sm:min-h-[160px] border border-gray-100 group">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#0f172a] group-hover:text-[#00E1FF] transition-colors mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.315 48.315 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                    </svg>
                    <span className="text-[#0f172a] font-semibold text-[11px] sm:text-xs md:text-sm leading-snug">Industry Standard<br />Quality</span>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Slim */}
        <section id="contact" className="py-10 bg-[#0f172a]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gradient-to-r from-[#00E1FF]/10 to-transparent rounded-2xl p-6 md:p-8">
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
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 whitespace-nowrap shadow-lg shadow-[#00E1FF]/20"
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
