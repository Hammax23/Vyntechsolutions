"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { servicesData, type ServiceData } from "@/data/servicesData";

// Services Data
const allServices = [
  { slug: "web-development", name: "Web Development" },
  { slug: "mobile-app-development", name: "Mobile App Development" },
  { slug: "cloud-solutions", name: "Cloud Solutions" },
  { slug: "ai-ml-solutions", name: "AI/ML Solutions" },
  { slug: "devops-cicd", name: "DevOps & CI/CD" },
  { slug: "ui-ux-design", name: "UI/UX Design" },
  { slug: "ecommerce-solutions", name: "E-commerce Solutions" },
  { slug: "custom-software-development", name: "Custom Software Development" },
  { slug: "seo-digital-marketing", name: "SEO/Digital Marketing" },
  { slug: "maintenance-support", name: "Maintenance & Support" },
  { slug: "tax-accounting", name: "Tax & Accounting Services" },
];

// Icon component
const FeatureIcon = ({ type }: { type: string }) => {
  const icons: { [key: string]: JSX.Element } = {
    code: <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />,
    mobile: <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />,
    api: <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />,
    speed: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />,
    default: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  };

  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      {icons[type] || icons.default}
    </svg>
  );
};

export default function ServicePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [service, setService] = useState<ServiceData | null>(servicesData[slug] || null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

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
        {/* Hero Section - Devsinc Style */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Image Cover */}
        <div className="absolute inset-0">
          <Image 
            src="/servicedetailcover.png" 
            alt={service.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#1a1a2e]/80" />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/50 text-sm mb-12">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>›</span>
            <Link href="/services" className="hover:text-white transition-colors">Services</Link>
            <span>›</span>
            <span className="text-white">{service.title}</span>
          </div>

          <div className="max-w-3xl">
            {/* Content */}
            <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                {service.title}
              </h1>
              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                {service.description}
              </p>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                className="inline-flex items-center gap-2 border border-white text-white hover:bg-[#262b3f] hover:border-[#262b3f] px-8 py-4 rounded-lg font-medium transition-all duration-300"
              >
                Build Your Project Now
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Combined Overview & Features Section */}
      <section id="features" className="py-20 bg-[#f8f9fa]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          {/* Header with Subtitle & Description */}
          <div className="max-w-4xl mx-auto text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e] mb-4">
              {service.subtitle}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              We focus on understanding your business goals first, then build solutions that actually solve problems — not just look good on paper. Every project gets dedicated attention, clear communication, and a team that takes ownership of delivering results on time.
            </p>
          </div>

          {/* What We Offer Label */}
          <div className="text-center mb-8">
            <span className="inline-block bg-[#262b3f]/10 text-[#262b3f] text-sm font-semibold px-4 py-2 rounded-full">
              What We Offer
            </span>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {service.features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-lg hover:border-[#262b3f]/30 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-[#262b3f]/10 rounded-lg flex items-center justify-center text-[#262b3f] group-hover:bg-[#262b3f] group-hover:text-white transition-all duration-300 mb-4">
                  <FeatureIcon type={feature.icon} />
                </div>
                <h3 className="text-base font-semibold text-[#1a1a2e] mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

{/* SEO Packages Section - Only for SEO/Digital Marketing */}
      {slug === "seo-digital-marketing" && (
        <section className="py-20 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <span className="inline-block bg-[#262b3f]/10 text-[#262b3f] text-sm font-semibold px-4 py-2 rounded-full mb-4">
                SEO Packages
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e] mb-4">
                Choose Your Growth Plan
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Transparent pricing with real deliverables. No hidden fees, no long-term contracts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {/* Starter Package */}
              <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#262b3f]/30 hover:shadow-xl transition-all duration-300">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-[#1a1a2e] mb-2">Starter</h3>
                  <p className="text-gray-500 text-sm">For small businesses getting started with SEO</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[#1a1a2e]">$799</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">Up to 10 keywords optimized</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">Technical SEO audit & fixes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">On-page optimization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">2 blog posts/month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">Google Business Profile setup</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">Monthly ranking report</span>
                  </li>
                </ul>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                  className="w-full py-3 px-6 border-2 border-[#262b3f] text-[#262b3f] font-semibold rounded-lg hover:bg-[#262b3f] hover:text-white transition-all duration-300"
                >
                  Get Started
                </button>
              </div>

              {/* Growth Package - Popular */}
              <div className="relative bg-[#1a1a2e] border-2 border-[#262b3f] rounded-2xl p-8 shadow-2xl transform md:-translate-y-4">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-[#0055FF] to-[#00AAFF] text-white text-xs font-bold px-4 py-1.5 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">Growth</h3>
                  <p className="text-white/60 text-sm">For businesses ready to scale their online presence</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">$1,499</span>
                  <span className="text-white/60">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-white/80 text-sm">Up to 25 keywords optimized</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-white/80 text-sm">Everything in Starter</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-white/80 text-sm">4 blog posts/month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-white/80 text-sm">Link building (10 backlinks/month)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-white/80 text-sm">Competitor analysis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-white/80 text-sm">Local SEO optimization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-white/80 text-sm">Bi-weekly strategy calls</span>
                  </li>
                </ul>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                  className="w-full py-3 px-6 bg-gradient-to-r from-[#0055FF] to-[#00AAFF] text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300"
                >
                  Get Started
                </button>
              </div>

              {/* Enterprise Package */}
              <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#262b3f]/30 hover:shadow-xl transition-all duration-300">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-[#1a1a2e] mb-2">Enterprise</h3>
                  <p className="text-gray-500 text-sm">For large businesses with aggressive growth goals</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[#1a1a2e]">$2,999</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">Unlimited keywords</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">Everything in Growth</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">8 blog posts/month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">Link building (25 backlinks/month)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">Google Ads management included</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">Dedicated SEO manager</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">Weekly strategy calls</span>
                  </li>
                </ul>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                  className="w-full py-3 px-6 border-2 border-[#262b3f] text-[#262b3f] font-semibold rounded-lg hover:bg-[#262b3f] hover:text-white transition-all duration-300"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-12 text-center">
              <p className="text-gray-500 text-sm mb-4">
                All packages include: Google Analytics setup, Search Console integration, and monthly performance reports.
              </p>
              <p className="text-gray-600 font-medium">
                Need a custom package? <button onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))} className="text-[#0055FF] hover:underline">Contact us</button> for a tailored solution.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Process Section - Timeline Style */}
      <section className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e] mb-4">
              Our Process
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A proven methodology that ensures successful delivery and exceeds expectations.
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-[#262b3f]/20" />
            
            <div className="space-y-12">
              {service.process.map((step, index) => (
                <div key={index} className={`relative flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Content */}
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right md:pr-16' : 'md:text-left md:pl-16'}`}>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 inline-block">
                      <h3 className="text-xl font-semibold text-[#1a1a2e] mb-2">{step.step}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  
                  {/* Number Circle */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 bg-[#262b3f] rounded-full items-center justify-center text-white font-bold text-lg shadow-lg">
                    {index + 1}
                  </div>
                  
                  {/* Mobile Number */}
                  <div className="md:hidden flex-shrink-0 w-10 h-10 bg-[#262b3f] rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  
                  {/* Empty Space */}
                  <div className="hidden md:block flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack - Devsinc Style - Hidden for Tax & Accounting */}
      {slug !== "tax-accounting" && (
      <section className="py-20 bg-[#1a1a2e]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Our Tech Stack
              </h2>
              <p className="text-white/60 max-w-xl">
                Equipped with the latest tools, our teams deliver impactful solutions designed to grow your business.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {[
              { name: "React", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
              { name: "Next.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
              { name: "Vue.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg" },
              { name: "Node.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
              { name: "Express", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
              { name: "Laravel", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg" },
              { name: "PHP", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" },
              { name: "Python", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
              { name: "Flask", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg" },
              { name: "TypeScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
              { name: "JavaScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
              { name: "Tailwind", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" },
              { name: "Bootstrap", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg" },
              { name: "PostgreSQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
              { name: "MongoDB", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
              { name: "Redis", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" },
              { name: "GraphQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg" },
              { name: "AWS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg" },
              { name: "Azure", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg" },
              { name: "Docker", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
              { name: "Kubernetes", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg" },
              { name: "Firebase", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" },
              { name: "Git", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
              { name: "Figma", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
            ].map((tech, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col items-center gap-2 hover:bg-white/10 transition-all duration-300 group"
              >
                <Image src={tech.logo} alt={tech.name} width={32} height={32} className="group-hover:scale-110 transition-transform duration-300" />
                <span className="text-white text-xs font-medium">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Why Choose Us Section - Premium Style - Hidden for Tax & Accounting */}
      {slug !== "tax-accounting" && (
      <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#262b3f]/5 rounded-full blur-3xl -translate-y-1/2"></div>
        
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-20">
            <span className="text-[#262b3f] text-sm font-medium tracking-wider uppercase mb-4 block">Our Approach</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a2e]">
              Why Choose VynTech Solutions?
            </h2>
          </div>

          {/* Curved Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Card 1 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#262b3f]/10 to-transparent rounded-[50px] rounded-bl-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 border border-gray-200 rounded-[50px] rounded-bl-none group-hover:border-[#262b3f]/50 transition-all duration-500"></div>
              <div className="relative p-6 pt-10 pb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#262b3f] to-[#1a1a2e] rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg shadow-[#262b3f]/25 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-3">End-to-End Expertise</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Complete solutions from planning to deployment and ongoing support.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="relative group lg:mt-8">
              <div className="absolute inset-0 bg-gradient-to-br from-[#262b3f]/10 to-transparent rounded-[50px] rounded-bl-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 border border-gray-200 rounded-[50px] rounded-bl-none group-hover:border-[#262b3f]/50 transition-all duration-500"></div>
              <div className="relative p-6 pt-10 pb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#262b3f] to-[#1a1a2e] rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg shadow-[#262b3f]/25 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-3">Modern Technologies</h3>
                <p className="text-gray-500 text-sm leading-relaxed">We use {service.technologies.slice(0, 3).join(", ")} and more for robust solutions.</p>
              </div>
            </div>

            {/* Card 3 - Center highlighted */}
            <div className="relative group lg:mt-4">
              <div className="absolute inset-0 bg-gradient-to-br from-[#262b3f]/10 to-transparent rounded-[50px] rounded-bl-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 border border-gray-200 rounded-[50px] rounded-bl-none group-hover:border-[#262b3f]/50 transition-all duration-500"></div>
              <div className="relative p-6 pt-10 pb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#262b3f] to-[#1a1a2e] rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg shadow-[#262b3f]/25 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-3">Scalable Solutions</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Built to grow with your business, from startup to enterprise scale.</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="relative group lg:mt-8">
              <div className="absolute inset-0 bg-gradient-to-br from-[#262b3f]/10 to-transparent rounded-[50px] rounded-bl-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 border border-gray-200 rounded-[50px] rounded-bl-none group-hover:border-[#262b3f]/50 transition-all duration-500"></div>
              <div className="relative p-6 pt-10 pb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#262b3f] to-[#1a1a2e] rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg shadow-[#262b3f]/25 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-3">Dedicated Team</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Direct communication with developers who understand your project.</p>
              </div>
            </div>

            {/* Card 5 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#262b3f]/10 to-transparent rounded-[50px] rounded-bl-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 border border-gray-200 rounded-[50px] rounded-bl-none group-hover:border-[#262b3f]/50 transition-all duration-500"></div>
              <div className="relative p-6 pt-10 pb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#262b3f] to-[#1a1a2e] rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg shadow-[#262b3f]/25 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-3">Security First</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Best practices for data protection and secure development.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* CTA Section - Slim */}
      <section id="contact" className="py-10 bg-[#1a1a2e]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gradient-to-r from-[#262b3f]/20 to-transparent rounded-2xl p-6 md:p-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Ready To Get Started?
              </h2>
              <p className="text-white/70 text-sm">
                Let&apos;s discuss how our {service.title.toLowerCase()} services can help transform your business.
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
