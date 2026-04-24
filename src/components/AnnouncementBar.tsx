"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the bar in this session
    const dismissed = sessionStorage.getItem("announcementDismissed");
    if (dismissed) {
      setIsVisible(false);
    }
    // Start animation after mount
    setTimeout(() => setIsAnimating(true), 100);
  }, []);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("announcementDismissed", "true");
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-[#0055FF] via-[#00B4FF] to-[#0055FF] transform transition-all duration-300 ${
        isAnimating ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 py-2.5 flex items-center justify-center gap-4 relative">
        {/* Sparkle Animation */}
        <div className="absolute left-4 hidden sm:flex items-center gap-1">
          <span className="animate-pulse">✨</span>
        </div>

        {/* Main Content */}
        <div className="flex items-center gap-2 sm:gap-4 text-white text-sm sm:text-base">
          <span className="hidden sm:inline-block bg-white/20 px-2 py-0.5 rounded text-xs font-bold animate-pulse">
            LIMITED OFFER
          </span>
          <span className="font-medium text-center">
            <span className="hidden sm:inline">🚀 Boost Your Rankings with Our</span>
            <span className="sm:hidden">🚀</span>
            {" "}
            <span className="font-bold">SEO Packages</span>
            {" "}
            <span className="hidden md:inline">— Starting from $799/mo</span>
          </span>
          <Link
            href="/services/seo-digital-marketing#packages"
            className="bg-white text-[#0055FF] px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-white/90 transition-all duration-300 hover:scale-105 whitespace-nowrap"
          >
            View Packages
          </Link>
        </div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute right-2 sm:right-4 text-white/80 hover:text-white transition-colors p-1"
          aria-label="Dismiss announcement"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
