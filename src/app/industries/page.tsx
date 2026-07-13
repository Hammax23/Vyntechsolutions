"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const industries = [
  {
    slug: "healthcare",
    title: "Healthcare & Pharmaceuticals",
    description: "Driving healthcare innovation with scalable solutions that enhance patient care, ensure compliance, and streamline operations.",
    icon: "healthcare",
    highlights: ["Patient Portals", "Telemedicine", "HIPAA Compliance", "Healthcare Analytics"]
  },
  {
    slug: "finance-banking",
    title: "Finance & Banking",
    description: "Secure, scalable fintech solutions that transform financial services with cutting-edge technology and regulatory compliance.",
    icon: "finance",
    highlights: ["Digital Banking", "Payment Solutions", "Risk Management", "Regulatory Compliance"]
  },
  {
    slug: "ecommerce-retail",
    title: "E-commerce & Retail",
    description: "End-to-end retail solutions that create seamless shopping experiences and drive customer engagement across all channels.",
    icon: "ecommerce",
    highlights: ["Online Stores", "Inventory Management", "POS Systems", "Customer Analytics"]
  },
  {
    slug: "education",
    title: "Education & E-learning",
    description: "Transforming education with innovative learning platforms that engage students and empower educators worldwide.",
    icon: "education",
    highlights: ["LMS Platforms", "Virtual Classrooms", "Student Portals", "EdTech Solutions"]
  },
  {
    slug: "real-estate",
    title: "Real Estate & Property",
    description: "Digital solutions that revolutionize property management, sales, and customer experiences in real estate.",
    icon: "realestate",
    highlights: ["Property Listings", "CRM Solutions", "Virtual Tours", "Transaction Management"]
  },
  {
    slug: "logistics",
    title: "Logistics & Transportation",
    description: "Streamline supply chain operations with intelligent logistics solutions that optimize routes and improve efficiency.",
    icon: "logistics",
    highlights: ["Fleet Management", "Route Optimization", "Warehouse Systems", "Real-time Tracking"]
  },
  {
    slug: "entertainment-media",
    title: "Entertainment & Media",
    description: "Engaging digital experiences for media and entertainment that captivate audiences and drive content delivery.",
    icon: "entertainment",
    highlights: ["Streaming Platforms", "Content Management", "Digital Publishing", "Media Analytics"]
  },
  {
    slug: "manufacturing",
    title: "Manufacturing & Industry",
    description: "Smart manufacturing solutions that optimize production, reduce costs, and drive operational excellence.",
    icon: "manufacturing",
    highlights: ["IoT Integration", "Production Planning", "Quality Control", "Supply Chain"]
  },
  {
    slug: "hospitality-travel",
    title: "Hospitality & Travel",
    description: "Elevate guest experiences with technology solutions that streamline bookings and enhance service delivery.",
    icon: "hospitality",
    highlights: ["Booking Systems", "Guest Management", "Revenue Optimization", "Travel Platforms"]
  },
  {
    slug: "telecommunications",
    title: "Telecommunications",
    description: "Next-generation telecom solutions that enhance connectivity, improve network performance, and drive innovation.",
    icon: "telecom",
    highlights: ["Network Management", "Billing Systems", "Customer Portals", "5G Solutions"]
  }
];

const IndustryIcon = ({ type }: { type: string }) => {
  const icons: { [key: string]: JSX.Element } = {
    healthcare: <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />,
    finance: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />,
    ecommerce: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />,
    education: <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />,
    realestate: <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />,
    logistics: <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />,
    entertainment: <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />,
    manufacturing: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />,
    hospitality: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />,
    telecom: <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
  };

  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      {icons[type] || icons.healthcare}
    </svg>
  );
};

export default function IndustriesPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [list, setList] = useState(industries);

  useEffect(() => {
    setIsVisible(true);

    fetch("/api/cms/industries")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const cmsIndustries = data?.industries as
          | {
              slug?: string;
              title?: string;
              description?: string;
              highlights?: string[];
              services?: { title?: string }[];
            }[]
          | undefined;
        if (!cmsIndustries?.length) return;

        setList(
          cmsIndustries.map((industry) => {
            const fallback = industries.find((d) => d.slug === industry.slug);
            const fromHighlights = Array.isArray(industry.highlights)
              ? industry.highlights.map(String).filter(Boolean)
              : [];
            const fromServices = Array.isArray(industry.services)
              ? industry.services.map((s) => String(s?.title || "")).filter(Boolean)
              : [];
            const highlights =
              fromHighlights.length > 0
                ? fromHighlights
                : fromServices.length > 0
                  ? fromServices
                  : fallback?.highlights || [];

            return {
              slug: String(industry.slug || fallback?.slug || ""),
              title: String(industry.title || fallback?.title || ""),
              description: String(industry.description || fallback?.description || ""),
              icon: fallback?.icon || "healthcare",
              highlights,
            };
          })
        );
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-[#1a1a2e] pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#1a1a2e]" />
            <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[#0d9488]/10 to-transparent" />
          </div>

          <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/50 text-sm mb-12">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <span className="text-[#0d9488]">Industries</span>
            </div>

            <div className={`max-w-3xl transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Discover Our Impact Across <span className="text-[#0d9488]">Industries</span>
              </h1>
              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                We deliver tailored technology solutions across diverse industries, helping businesses transform their operations, enhance customer experiences, and drive sustainable growth.
              </p>
              <Link
                href="#industries"
                className="inline-flex items-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white px-8 py-4 rounded-lg font-medium transition-all duration-300"
              >
                Explore Industries
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Industries Grid */}
        <section id="industries" className="py-20 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e] mb-4">
                Industries We Serve
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                From healthcare to fintech, we bring deep domain expertise and cutting-edge technology to solve your industry&apos;s unique challenges.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((industry, index) => (
                <Link
                  key={industry.slug}
                  href={`/industries/${industry.slug}`}
                  className="group bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl hover:border-[#0d9488]/30 transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-[#0d9488]/10 rounded-xl flex items-center justify-center text-[#0d9488] mb-6 group-hover:bg-[#0d9488] group-hover:text-white transition-all duration-300">
                    <IndustryIcon type={industry.icon} />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1a1a2e] mb-3 group-hover:text-[#0d9488] transition-colors">
                    {industry.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {industry.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {industry.highlights.slice(0, 3).map((highlight, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {highlight}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-[#0d9488] font-medium group-hover:gap-3 transition-all duration-300">
                    Learn More
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-[#1a1a2e]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-[#0d9488] mb-2">10+</div>
                <div className="text-white/60">Industries Served</div>
              </div>
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-[#0d9488] mb-2">500+</div>
                <div className="text-white/60">Projects Delivered</div>
              </div>
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-[#0d9488] mb-2">98%</div>
                <div className="text-white/60">Client Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-[#0d9488] mb-2">15+</div>
                <div className="text-white/60">Years Experience</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] rounded-3xl p-12 md:p-16">
              <div className="max-w-2xl">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  Ready to Transform Your Industry?
                </h2>
                <p className="text-white/70 text-lg mb-8">
                  Let&apos;s discuss how our industry expertise and technology solutions can help drive your business forward.
                </p>
                <Link
                  href="/#get-in-touch"
                  className="inline-flex items-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white px-8 py-4 rounded-lg font-medium transition-all duration-300"
                >
                  Let&apos;s Talk Business
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
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
