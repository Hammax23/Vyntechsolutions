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
    description: "Good enough isn't in our vocabulary. From the first line of code to the final pixel, we sweat the details others skip because your business deserves work we're genuinely proud of.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Radical Transparency",
    description: "No surprise invoices, no vague timelines, no vanishing acts mid-project. You'll always know exactly where things stand, what's next, and why straight talk, every step of the way.",
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
    description: "We're not here to just check boxes and send invoices. When you win, we win. That's why we treat every project like it's our own business on the line.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Speed Without Sacrifice",
    description: "Fast doesn't have to mean sloppy. We move quickly, stay agile, and still build things that hold up because rushed work today just means rework tomorrow.",
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
    description: "Before we write a single line of code, we get to know your business inside out your goals, your users, your constraints. We align on the vision first, so nothing gets lost in translation later.",
  },
  {
    number: "02",
    title: "Architecture & Design",
    description: "We design systems built to grow with you, not just work for today. Every screen, every interaction, and every technical decision is intentional, laying a foundation that's scalable, intuitive, and built to last.",
  },
  {
    number: "03",
    title: "Agile Development",
    description: "You'll never be left wondering what's happening behind the scenes. With two-week sprints and live demos, you see real progress, give real feedback, and stay in the loop from the very first build.",
  },
  {
    number: "04",
    title: "Launch & Scale",
    description: "Launch day isn't the finish line it's the starting point. We test rigorously, deploy without disruption, and stick around to optimize, support, and scale your product long after it goes live.",
  },
];

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
    fetch("/api/cms/content?type=static-page&slug=about")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.page) return;
        const page = data.page as Record<string, unknown>;
        if (page.heroHeading) setHeroHeading(String(page.heroHeading));
        if (page.heroBody) setHeroBody(String(page.heroBody));

        // Handle Strapi v4 or flat structure for images
        const heroImg = page.heroimage as any || page.heroImage as any;
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

        const body = page.body != null ? String(page.body).trim() : "";
        if (body) setBodyHtml(body);
        if (page.sections && typeof page.sections === "object" && !Array.isArray(page.sections)) {
          setSections(page.sections as AboutSections);
        }
      })
      .catch(() => { });
    return () => {
      cancelled = true;
    };
  }, []);

  const renderHeroHeading = () => {
    if (!heroHeading) {
      return (
        <>
          We Build Software That
          <span className="block mt-2">
            Drives <span className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">Growth</span>
          </span>
        </>
      );
    }

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
    // If there's no newline, apply the blue gradient text to the last word
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section - Enterprise Level */}
        <section ref={heroRef} className="relative bg-[#0a0a14] pt-32 pb-24 overflow-hidden">
          {/* Background Elements */}
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
                  VynTech Solutions is a full-service software development company helping businesses across Canada transform bold ideas into powerful, scalable digital products built with precision, speed, and long-term growth in mind.
                </p>

                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-[#0055FF]/25 hover:opacity-90 transition-all"
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
                    <span className="inline-block text-sm font-semibold bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text tracking-wider uppercase mb-4">Our Mission</span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e] mb-6 leading-tight">
                      {(() => {
                        const heading = "Empowering Your Business Through Innovative Technology";
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
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                      You deserve more than just a service provider you deserve a partner invested in your success. At VynTech Solutions, we bridge the gap between your vision and technical execution, delivering software that's not just functional but transformative for your business.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-10">
                      Whether you're a startup validating your first MVP or an enterprise modernizing legacy systems, we bring the same dedication, expertise, and passion to every project we take on because your growth is our priority.
                    </p>
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-white px-8 py-3.5 rounded-full font-semibold hover:opacity-90 transition-all shadow-lg shadow-[#0055FF]/25"
                    >
                      Work With Us
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex flex-col gap-4 relative z-10">
                    {[
                      { title: "Web Design & Development", subtitle: "500+ custom websites delivered for businesses like yours", icon: "💻" },
                      { title: "SEO & Digital Marketing", subtitle: "300% average traffic growth — real results you can measure", icon: "📈" },
                      { title: "UI/UX", subtitle: "Branding trusted by 100+ Canadian businesses", icon: "🎨" },
                      { title: "AI & ML", subtitle: "Automation strategies built to save you hours, every week.", icon: "🤖" },
                    ].map((stat, i) => (
                      <div key={i} className="flex items-center gap-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1)] transition-shadow cursor-default">
                        <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-xl flex items-center justify-center text-2xl border border-gray-100">
                          {stat.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-[#1a1a2e] text-base mb-1">{stat.title}</h4>
                          <p className="text-gray-500 text-sm">{stat.subtitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Values Section */}
            <section className="py-24 bg-[#0a0a14]">
              <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
                <div className="text-center mb-16">
                  <span className="inline-block text-sm font-semibold bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text tracking-widest uppercase mb-4">What Drives Us</span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                    Our Core Values
                  </h2>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {values.map((value, index) => (
                    <div
                      key={index}
                      className="bg-[#1a1a2e] rounded-2xl p-8 border border-white/5 hover:border-white/10 transition-all duration-300"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00E1FF]/10 to-[#0055FF]/10 text-[#00E1FF] flex items-center justify-center mb-6">
                        {value.icon}
                      </div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text mb-3">{value.title}</h3>
                      <p className="text-white/60 text-sm leading-relaxed">{value.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Process Section */}
            <section className="py-24 bg-white">
              <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
                <div className="text-center mb-16">
                  <span className="inline-block text-sm font-semibold bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text tracking-wider uppercase mb-4">Our Process</span>
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
                        <div className="hidden lg:block absolute top-8 left-full w-full h-[2px] bg-gradient-to-r from-[#00E1FF]/30 to-transparent -translate-x-4" />
                      )}
                      <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100">
                        <div className="text-5xl font-bold bg-gradient-to-br from-[#00E1FF] to-[#0055FF] bg-clip-text text-transparent mb-4">
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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#00E1FF]/20 to-[#0055FF]/20 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to Build Something
                <span className="block bg-gradient-to-r from-[#00E1FF] to-[#0055FF] bg-clip-text text-transparent">
                  Extraordinary?
                </span>
              </h2>
              <p className="text-white/60 text-lg mb-10">
                Let&apos;s discuss your project and explore how we can help you achieve your goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                  className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-[#0055FF]/25"
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
