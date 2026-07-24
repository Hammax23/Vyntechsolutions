"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { servicesData, type ServiceData } from "@/data/servicesData";
import { industriesData } from "@/data/industriesData";
import CityFAQ from "@/components/CityFAQ";

const engagementStrategies = [
  {
    id: "content",
    title: "Engaging Content",
    description: "Quality content is the backbone of any successful digital presence. We craft compelling, SEO-optimized copy that resonates with your local audience and drives action.",
    calloutTitle: "Struggling with Bounce Rates?",
    calloutText: "Compelling content keeps visitors engaged. Let our team write copy that converts."
  },
  {
    id: "cta",
    title: "Call-To-Actions",
    description: "This feature has the power to compel your customers. Higher interaction and traffic can be achieved with the help of compelling CTAs that create a sense of urgency for the website visitors. For the architecture of a CTA, we follow a proper format. With comprehensive expertise in broader portfolios, our accomplished team will ensure maximum leverage from your portal.",
    calloutTitle: "Struggling with Low Conversions?",
    calloutText: "Effective CTAs can change that. Let VynTech Solutions design the perfect CTAs to boost your sales. Contact us now!"
  },
  {
    id: "blog",
    title: "Informative Blog",
    description: "An active, informative blog establishes your authority and keeps your website fresh for search engines. We implement scalable blog architectures that attract organic traffic over time.",
    calloutTitle: "Need More Organic Traffic?",
    calloutText: "A strategic blog can multiply your inbound leads. Ask us about our content strategy services."
  },
  {
    id: "mobile",
    title: "Mobile Responsive",
    description: "With the majority of local searches happening on mobile devices, a seamless mobile experience is non-negotiable. Our designs are fluid, adapting perfectly to any screen size for maximum engagement.",
    calloutTitle: "Losing Mobile Customers?",
    calloutText: "Don't let a poor mobile experience cost you sales. We build mobile-first designs."
  },
  {
    id: "functionality",
    title: "Proper Functionality",
    description: "Broken links, slow load times, and clunky navigation frustrate users. We rigorously test all features to ensure flawless performance that builds trust with your visitors.",
    calloutTitle: "Is Your Site Slow or Buggy?",
    calloutText: "Technical issues kill conversions. Let us optimize your site's performance today."
  },
  {
    id: "media",
    title: "Rich Media",
    description: "High-quality images, videos, and interactive elements capture attention faster than text alone. We integrate optimized rich media that enhances your message without slowing down your site.",
    calloutTitle: "Want to Stand Out Visually?",
    calloutText: "Engage visitors instantly with custom graphics and optimized video content."
  },
  {
    id: "social",
    title: "Integrating Social Media",
    description: "Connect your website directly to your social channels. We build seamless integrations that encourage sharing, social proof, and community growth right from your landing pages.",
    calloutTitle: "Looking to Grow Your Following?",
    calloutText: "Turn website visitors into loyal followers with integrated social strategies."
  },
  {
    id: "consumer",
    title: "Consumer-Centric Design",
    description: "We don't just design for looks; we design for your specific user. By analyzing user behavior, we create intuitive journeys that guide visitors naturally toward becoming customers.",
    calloutTitle: "Are Users Getting Lost?",
    calloutText: "Streamline your user journey with our UX/UI design expertise."
  }
];

export default function CityServicePage() {
  const params = useParams();
  const slug = params.slug as string;
  const cityParam = params.city as string;
  const formattedCity = cityParam
    ? cityParam
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "";

  const [service, setService] = useState<ServiceData | null>(servicesData[slug] || null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    let cancelled = false;
    fetch(`/api/cms/services/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.service) setService(data.service);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!service) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#1a1a2e] mb-4">Service Not Found</h1>
          <Link href="/" className="text-[#262b3f] hover:underline">
            Return to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Simple Local Hero */}
        <section className="relative pt-28 pb-16 bg-[#0d1117] overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at top right, rgba(0,225,255,0.1) 0%, transparent 50%), radial-gradient(circle at bottom left, rgba(0,85,255,0.1) 0%, transparent 50%)' }} />
          <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center max-w-3xl mx-auto transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="inline-flex items-center gap-2 border border-[#00E1FF]/20 bg-[#00E1FF]/5 backdrop-blur-sm rounded-full px-5 py-2 mb-8 shadow-[0_0_15px_rgba(0,225,255,0.1)]">
                <span className="text-sm font-bold bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text uppercase tracking-[0.2em]">{service.title} in {formattedCity}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-[1.1]">
                {service.title} Services in
                <span className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text block mt-2">{formattedCity}</span>
              </h1>
              <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-lg mx-auto">
                {service.description} We are the trusted local partner for businesses in {formattedCity}.
              </p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] hover:opacity-90 text-white px-7 py-4 rounded-xl font-semibold text-base transition-all duration-300 shadow-lg shadow-[#00E1FF]/25"
              >
                Request a Free Quote
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section className="py-20 lg:py-28 bg-white">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0d1117] mb-6 leading-[1.1] tracking-tight">
                  Why Choose Us for {service.title} in {formattedCity}?
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] rounded-full mb-8 shadow-sm"></div>
                <p className="text-lg text-gray-600 leading-relaxed mb-6 font-light">
                  {service.overview}
                </p>
                <p className="text-lg text-gray-600 leading-relaxed font-light">
                  Our team is dedicated to providing high-quality digital solutions tailored specifically for the {formattedCity} market. Let us help you dominate your local industry.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {service.features?.slice(0, 4).map((feature, idx) => (
                  <div key={idx} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 sm:p-8 hover:shadow-[0_20px_40px_-15px_rgba(0,85,255,0.15)] hover:border-[#00E1FF]/30 transition-all duration-500 group">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#0055FF]/5 transition-colors">
                      <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-[#00E1FF] to-[#0055FF] opacity-90 group-hover:scale-110 transition-transform"></div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#0d1117] mb-2 sm:mb-3">{feature.title}</h3>
                    <p className="text-gray-500 leading-relaxed text-sm sm:text-base font-light">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Engagement Section */}
        {slug !== "seo-digital-marketing" && (
        <section className="py-20 lg:py-28 bg-gray-50 border-t border-gray-100">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0d1117] text-center mb-16">
              How Will We Increase Engagement Through <span className="relative inline-block"><span className="relative z-10">{service.title}</span><span className="absolute bottom-1 left-0 w-full h-3 bg-gradient-to-r from-[#00E1FF]/30 to-[#0055FF]/30 -z-10"></span></span>
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
              {/* Sidebar Tabs */}
              <div className="lg:col-span-4 flex flex-col space-y-3">
                {engagementStrategies.map((strategy, idx) => (
                  <button
                    key={strategy.id}
                    onClick={() => setActiveTab(idx)}
                    className={`text-left px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-between border ${
                      activeTab === idx 
                        ? "bg-white border-[#00E1FF]/20 shadow-[0_8px_30px_-4px_rgba(0,85,255,0.1)] text-transparent bg-clip-text bg-gradient-to-r from-[#00E1FF] to-[#0055FF]" 
                        : "bg-transparent border-transparent text-gray-600 hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <span>{strategy.title}</span>
                    {activeTab === idx && (
                      <svg className="w-5 h-5 text-[#0055FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="lg:col-span-8 lg:pl-12">
                <h3 className="text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00E1FF] to-[#0055FF] mb-6 tracking-tight">
                  {engagementStrategies[activeTab].title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-10 font-light">
                  {engagementStrategies[activeTab].description}
                </p>
                
                {/* Callout Box */}
                <div className="border-l-[4px] border-[#0055FF] bg-gradient-to-r from-white to-gray-50/50 p-8 shadow-sm rounded-r-2xl">
                  <h4 className="text-[#0055FF] font-extrabold text-lg mb-2">
                    {engagementStrategies[activeTab].calloutTitle}
                  </h4>
                  <p className="text-gray-600 mb-6 font-light">
                    {engagementStrategies[activeTab].calloutText}
                  </p>
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                    className="flex items-center gap-2 font-bold text-[#0d1117] hover:text-[#0055FF] transition-colors group"
                  >
                    Contact Us 
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* SEO ONLY: Local Ranking Factors */}
        {slug === "seo-digital-marketing" && (
          <section className="py-20 lg:py-28 bg-[#f8fbff] border-t border-b border-[#0055FF]/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#00E1FF]/5 to-[#0055FF]/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h4 className="text-[#0055FF] font-bold tracking-[0.2em] uppercase text-sm mb-4">
                  What We Optimize
                </h4>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0d1117] mb-6 leading-tight">
                  Dominating the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E1FF] to-[#0055FF]">{formattedCity}</span> Search Results
                </h2>
                <p className="text-gray-600 text-lg font-light">
                  Ranking in the local map pack requires a precise, technical approach. Here is exactly what we optimize to push your business to the top of Google.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: "Google Business Profile",
                    desc: "Full optimization of your GBP, including categories, attributes, products, and regular geo-tagged posts to boost relevance.",
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  },
                  {
                    title: "Local Citations",
                    desc: "Building consistent NAP (Name, Address, Phone) citations across high-authority directories specifically relevant to your area.",
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  },
                  {
                    title: "On-Page Localization",
                    desc: "Injecting hyper-local keywords, schema markup, and neighborhood references directly into your website's architecture.",
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  },
                  {
                    title: "Review Management",
                    desc: "Implementing automated systems to generate positive reviews from your best clients, a major ranking signal for local SEO.",
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  }
                ].map((item, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-[0_20px_40px_-15px_rgba(0,85,255,0.1)] transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 text-[#0055FF] flex items-center justify-center mb-6 group-hover:bg-[#0055FF] group-hover:text-white transition-colors duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {item.icon}
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-[#0d1117] mb-3 group-hover:text-[#0055FF] transition-colors">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed font-light">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SEO ONLY: Local Advantage Banner */}
        {slug === "seo-digital-marketing" && (
          <section className="py-20 bg-white">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-[2rem] overflow-hidden relative shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#00E1FF]/20 to-[#0055FF]/20 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 p-6 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 leading-tight">
                      Ready to Capture the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E1FF] to-[#0055FF]">{formattedCity}</span> Market?
                    </h2>
                    <p className="text-gray-300 text-lg font-light mb-8 leading-relaxed max-w-lg">
                      46% of all Google searches have local intent. If you aren't visible when local customers search for your services, you're handing revenue directly to your competitors. Let's fix that.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))} className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-white px-8 py-4 rounded-full font-bold text-sm shadow-[0_8px_20px_rgba(0,85,255,0.2)] hover:shadow-[0_12px_25px_rgba(0,85,255,0.4)] hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto flex justify-center items-center text-center">
                        Get a Free Local SEO Audit
                      </button>
                      <button onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))} className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full font-bold text-sm hover:bg-white hover:text-[#0f172a] transition-all duration-300 w-full sm:w-auto flex justify-center items-center text-center">
                        Speak with a Strategist
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 lg:mt-0">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                      <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00E1FF] to-[#0055FF] mb-2">97%</div>
                      <div className="text-gray-300 text-sm font-medium">Of people learn more about a local company online than anywhere else.</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center sm:translate-y-6">
                      <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00E1FF] to-[#0055FF] mb-2">88%</div>
                      <div className="text-gray-300 text-sm font-medium">Of local mobile searches result in a call or visit within 24 hours.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* About City Section */}
        <section className="py-20 lg:py-28 bg-white">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              
              {/* Left Column */}
              <div className="lg:col-span-7 lg:pr-8">
                <h4 className="text-[#00E1FF] font-bold tracking-[0.2em] uppercase text-sm mb-4">
                  About {formattedCity}
                </h4>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0d1117] mb-8 leading-[1.1] tracking-tight">
                  {service.title} for {formattedCity} Businesses
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-12 font-light">
                  {formattedCity} is a highly competitive digital market — with hundreds of thousands of businesses all fighting for the same Google searches. A generic digital presence won't cut it here. VynTech Solutions builds custom, conversion-focused {service.title.toLowerCase()} campaigns for {formattedCity} businesses that are engineered to rank, load fast, and turn visitors into paying customers. We understand the {formattedCity} market deeply. Our strategies are tailored to local neighbourhoods and business verticals — so you're not just getting traffic, you're getting the right traffic. With five-star reviews and clients across every major industry, we're the agency that {formattedCity} businesses trust to grow online.
                </p>

                <h3 className="text-xl font-bold text-[#0d1117] mb-6">
                  Industries We Serve in {formattedCity}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { slug: "healthcare", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /> },
                    { slug: "ecommerce-retail", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /> },
                    { slug: "real-estate", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
                    { slug: "hospitality-travel", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /> }
                  ].map((industry, idx) => (
                    <Link href={`/industries/${industry.slug}`} key={idx} className="flex items-center gap-3 bg-white border border-gray-100 shadow-sm rounded-xl px-4 py-3 hover:shadow-[0_4px_20px_rgba(0,85,255,0.12)] hover:border-[#0055FF]/30 transition-all duration-300 group cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-gradient-to-br group-hover:from-[#00E1FF] group-hover:to-[#0055FF] transition-all duration-300">
                        <svg className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {industry.icon}
                        </svg>
                      </div>
                      <span className="text-[#0d1117] font-semibold text-sm group-hover:text-[#0055FF] transition-colors">
                        {industriesData[industry.slug]?.title || industry.slug}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right Column: Card */}
              <div className="lg:col-span-5 relative">
                <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100/60 p-8 sm:p-10 sticky top-32">
                  <h3 className="text-2xl lg:text-3xl font-extrabold text-[#0d1117] mb-8 leading-[1.2] tracking-tight">
                    Why {formattedCity} Businesses Choose VynTech
                  </h3>
                  
                  <ul className="space-y-6 mb-10">
                    {[
                      `${formattedCity}'s leading ${service.title.toLowerCase()} agency`,
                      `Custom strategies engineered to dominate the ${formattedCity} market`,
                      `Local market expertise and dedicated support`,
                      `Mobile-first approach — capturing local smartphone searches`
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-[#0055FF] flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-700 text-sm sm:text-base">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-gray-100 pt-6 mb-8 flex items-center gap-3 text-gray-500 text-sm">
                    <svg className="w-5 h-5 text-[#00E1FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Mon-Fri: 9:00 AM – 6:00 PM EST
                  </div>

                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-white py-4 rounded-xl font-bold hover:shadow-[0_4px_20px_rgba(0,85,255,0.3)] transition-all duration-300 group"
                  >
                    Get a Free {formattedCity} Quote
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Dynamic FAQ for City Page */}
        <CityFAQ formattedCity={formattedCity} serviceTitle={service.title} />

        {/* Local CTA */}
        <section className="py-8 bg-[#0d1117] relative overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(0,85,255,0.15) 0%, transparent 60%)' }} />
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Grow Your Business in {formattedCity}?
            </h2>
            <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
              Contact us today to discuss your {service.title.toLowerCase()} project. We provide custom quotes and transparent timelines.
            </p>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
              className="bg-white text-[#0d1117] px-8 py-3 rounded-full font-bold text-base hover:bg-gradient-to-r hover:from-[#00E1FF] hover:to-[#0055FF] hover:text-white hover:shadow-[0_0_30px_rgba(0,225,255,0.4)] hover:-translate-y-1 transition-all duration-300 shadow-xl"
            >
              Let's Talk Business
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
