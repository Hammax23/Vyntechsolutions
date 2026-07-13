"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TechnologyImpact from "@/components/TechnologyImpact";
import CmsHtml from "@/components/CmsHtml";

type AboutSections = {
  missionHeading?: string;
  missionBody?: string;
  missionBody2?: string;
  [key: string]: unknown;
};

const values = [
  {
    title: "Excellence First",
    description: "We don't ship average. Every line of code, every design decision reflects our commitment to quality.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Radical Transparency",
    description: "No hidden costs, no scope creep surprises. You'll always know exactly where your project stands.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Partnership Mindset",
    description: "We're not just vendors — we're invested in your success. Your wins are our wins.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Speed Without Sacrifice",
    description: "Agile delivery that doesn't cut corners. We move fast and build things that last.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    gradient: "from-orange-500 to-red-500",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Discovery & Strategy",
    description: "Deep dive into your business goals, target users, and technical requirements. We align on vision before writing a single line of code.",
  },
  {
    number: "02",
    title: "Architecture & Design",
    description: "Scalable system design and intuitive UX/UI that sets the foundation for success. Every decision is intentional.",
  },
  {
    number: "03",
    title: "Agile Development",
    description: "Two-week sprints with continuous demos. You see progress in real-time and provide feedback that shapes the product.",
  },
  {
    number: "04",
    title: "Launch & Scale",
    description: "Rigorous testing, seamless deployment, and ongoing optimization. We stay with you well beyond launch day.",
  },
];

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [heroHeading, setHeroHeading] = useState("");
  const [heroBody, setHeroBody] = useState("");
  const [bodyHtml, setBodyHtml] = useState<string | null>(null);
  const [sections, setSections] = useState<AboutSections | null>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsVisible(true);
    let cancelled = false;
    fetch("/api/cms/content?type=static-page&slug=about")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.page) return;
        const page = data.page as Record<string, unknown>;
        if (page.heroHeading) setHeroHeading(String(page.heroHeading));
        if (page.heroBody) setHeroBody(String(page.heroBody));
        const body = page.body != null ? String(page.body).trim() : "";
        if (body) setBodyHtml(body);
        if (page.sections && typeof page.sections === "object" && !Array.isArray(page.sections)) {
          setSections(page.sections as AboutSections);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const renderHeroHeading = () => {
    if (!heroHeading) {
      return (
        <>
          We Build Software
          <span className="block text-blue-400">That Drives Growth</span>
        </>
      );
    }
    if (heroHeading.includes("\n")) {
      const [first, ...rest] = heroHeading.split("\n");
      return (
        <>
          {first}
          {rest.length > 0 && (
            <span className="block text-blue-400">{rest.join("\n")}</span>
          )}
        </>
      );
    }
    return heroHeading;
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section - Enterprise Level */}
        <section ref={heroRef} className="relative bg-[#0a0a14] pt-32 pb-24 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
          </div>
          
          <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6">
            {/* Breadcrumb */}
            <div className={`flex items-center gap-2 text-white/40 text-sm mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-white/70">About</span>
            </div>

            <div className="max-w-3xl">
              <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1]">
                  {renderHeroHeading()}
                </h1>
                
                <p className="text-lg text-white/60 mb-8 leading-relaxed">
                  {heroBody ||
                    "VynTech Solutions is a full-service software development company helping businesses transform ideas into powerful digital products."}
                </p>

                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                  className="group inline-flex items-center gap-2 bg-white text-[#0a0a14] px-6 py-3.5 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                >
                  Start a Project
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
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
            {/* Mission Section */}
            <section className="py-24 bg-gradient-to-b from-white to-gray-50">
              <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div>
                    <span className="inline-block text-sm font-semibold text-blue-600 tracking-wider uppercase mb-4">Our Mission</span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e] mb-6 leading-tight">
                      {sections?.missionHeading ||
                        "Empowering Businesses Through Innovative Technology"}
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                      {sections?.missionBody ||
                        "We believe every business deserves access to world-class software. Our mission is to bridge the gap between visionary ideas and technical execution — delivering solutions that are not just functional, but transformative."}
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      {sections?.missionBody2 ||
                        "Whether you\u2019re a startup validating your first MVP or an enterprise modernizing legacy systems, we bring the same level of dedication, expertise, and passion to every project."}
                    </p>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-20" />
                    <div className="relative bg-[#1a1a2e] rounded-3xl p-8 sm:p-10">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="text-center p-4">
                          <div className="text-4xl font-bold text-white mb-2">5+</div>
                          <div className="text-sm text-white/60">Years of Excellence</div>
                        </div>
                        <div className="text-center p-4">
                          <div className="text-4xl font-bold text-white mb-2">30+</div>
                          <div className="text-sm text-white/60">Expert Engineers</div>
                        </div>
                        <div className="text-center p-4">
                          <div className="text-4xl font-bold text-white mb-2">24/7</div>
                          <div className="text-sm text-white/60">Support Available</div>
                        </div>
                        <div className="text-center p-4">
                          <div className="text-4xl font-bold text-white mb-2">3x</div>
                          <div className="text-sm text-white/60">Faster Delivery</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Values Section */}
            <section className="py-24 bg-gray-50">
              <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
                <div className="text-center mb-16">
                  <span className="inline-block text-sm font-semibold text-blue-600 tracking-wider uppercase mb-4">Our Values</span>
                  <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e] mb-4">
                    What Drives Us Every Day
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    These aren&apos;t just words on a wall — they&apos;re principles that guide every decision we make.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {values.map((value, index) => (
                    <div
                      key={index}
                      className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${value.gradient} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform`}>
                        {value.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-[#1a1a2e] mb-2">{value.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Process Section */}
            <section className="py-24 bg-white">
              <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
                <div className="text-center mb-16">
                  <span className="inline-block text-sm font-semibold text-blue-600 tracking-wider uppercase mb-4">Our Process</span>
                  <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e] mb-4">
                    How We Bring Ideas to Life
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    A proven methodology refined over hundreds of successful projects.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {processSteps.map((step, index) => (
                    <div key={index} className="relative">
                      {index < processSteps.length - 1 && (
                        <div className="hidden lg:block absolute top-8 left-full w-full h-[2px] bg-gradient-to-r from-blue-500/30 to-transparent -translate-x-4" />
                      )}
                      <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100">
                        <div className="text-5xl font-bold bg-gradient-to-br from-blue-500 to-purple-500 bg-clip-text text-transparent mb-4">
                          {step.number}
                        </div>
                        <h3 className="text-lg font-semibold text-[#1a1a2e] mb-2">{step.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Technology Impact Section */}
        <TechnologyImpact />

        {/* CTA Section */}
        <section className="py-24 bg-[#0a0a14] relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to Build Something
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Extraordinary?
                </span>
              </h2>
              <p className="text-white/60 text-lg mb-10">
                Let&apos;s discuss your project and explore how we can help you achieve your goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                  className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-blue-500/25"
                >
                  Start Your Project
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
                <a
                  href="mailto:info@vyntechsolutions.ca"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
