"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function FloatingSEOButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Show button after scrolling down a bit
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsExpanded(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-24 right-6 z-50 transition-all duration-500 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      }`}
    >
      {/* Expanded Panel */}
      <div
        className={`absolute bottom-16 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 ${
          isExpanded ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0055FF] to-[#00B4FF] p-4">
          <h4 className="text-white font-bold text-lg">Boost Your Rankings</h4>
          <p className="text-white/80 text-sm mt-1">Choose the perfect SEO package for your business</p>
        </div>

        {/* Package Options */}
        <div className="p-4 space-y-3">
          <Link
            href="/services/seo-digital-marketing"
            className="block p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-[#0055FF]">Starter</p>
                <p className="text-xs text-gray-500">For small businesses</p>
              </div>
              <span className="text-[#0055FF] font-bold">$799/mo</span>
            </div>
          </Link>

          <Link
            href="/services/seo-digital-marketing"
            className="block p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-[#0055FF]/20 hover:border-[#0055FF] transition-colors group relative"
          >
            <span className="absolute -top-2 right-3 bg-[#0055FF] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              POPULAR
            </span>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-[#0055FF]">Growth</p>
                <p className="text-xs text-gray-500">Scale your presence</p>
              </div>
              <span className="text-[#0055FF] font-bold">$1,499/mo</span>
            </div>
          </Link>

          <Link
            href="/services/seo-digital-marketing"
            className="block p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-[#0055FF]">Enterprise</p>
                <p className="text-xs text-gray-500">Full-scale dominance</p>
              </div>
              <span className="text-[#0055FF] font-bold">$2,999/mo</span>
            </div>
          </Link>
        </div>

        {/* CTA */}
        <div className="px-4 pb-4">
          <Link
            href="/services/seo-digital-marketing"
            className="block w-full bg-gradient-to-r from-[#0055FF] to-[#00B4FF] text-white text-center py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
          >
            View All Packages →
          </Link>
        </div>
      </div>

      {/* Main Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`group flex items-center gap-3 bg-gradient-to-r from-[#0055FF] to-[#00B4FF] text-white px-5 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 ${
          isExpanded ? "ring-4 ring-blue-500/20" : ""
        }`}
      >
        {/* Pulse Animation */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-white/30"></span>
        </span>

        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <span className="font-semibold whitespace-nowrap">SEO Packages</span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}
