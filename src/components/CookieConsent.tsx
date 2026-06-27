"use client";

import { useState, useEffect } from "react";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

// iOS-style Toggle Switch Component
const IOSToggle = ({ 
  enabled, 
  onChange, 
  disabled = false 
}: { 
  enabled: boolean; 
  onChange: () => void; 
  disabled?: boolean;
}) => (
  <button
    onClick={onChange}
    disabled={disabled}
    className={`relative inline-flex h-[28px] w-[52px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 ${
      disabled ? 'cursor-not-allowed opacity-60' : ''
    } ${enabled ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gray-600/80'}`}
    style={{
      boxShadow: enabled 
        ? 'inset 0 0 0 1px rgba(255,255,255,0.1), 0 2px 8px rgba(52, 211, 153, 0.3)' 
        : 'inset 0 2px 4px rgba(0,0,0,0.2)'
    }}
  >
    <span
      className={`pointer-events-none inline-block h-[24px] w-[24px] transform rounded-full bg-white shadow-lg ring-0 transition-all duration-300 ease-in-out ${
        enabled ? 'translate-x-[24px]' : 'translate-x-0'
      }`}
      style={{
        boxShadow: '0 2px 6px rgba(0,0,0,0.2), 0 0 1px rgba(0,0,0,0.1)'
      }}
    />
  </button>
);

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setTimeout(() => setIsAnimating(true), 50);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    localStorage.setItem("cookieConsent", JSON.stringify(allAccepted));
    handleClose();
  };

  const handleRejectAll = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    localStorage.setItem("cookieConsent", JSON.stringify(essentialOnly));
    handleClose();
  };

  const handleSavePreferences = () => {
    localStorage.setItem("cookieConsent", JSON.stringify(preferences));
    setShowCustomize(false);
    handleClose();
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "essential") return;
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Main Banner - Glass morphism style */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-[9999] transition-all duration-500 ease-out ${
          isAnimating && !showCustomize ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif" }}
      >
        {/* Gradient border top */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="relative backdrop-blur-xl bg-[#0a0a14]/90 border-t border-white/5">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
          
          <div className="relative max-w-7xl mx-auto px-6 py-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              {/* Content */}
              <div className="flex items-start gap-4 flex-1">
                {/* Cookie Icon */}
                <div className="hidden sm:flex shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 items-center justify-center border border-amber-400/20">
                  <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-.34-.02-.68-.05-1.01-.26.15-.56.24-.87.27-.49.04-.99-.12-1.38-.44-.4-.32-.67-.78-.76-1.29-.09-.51.01-1.04.28-1.47.27-.44.68-.77 1.17-.94.13-.04.26-.07.4-.08-.52-1.12-1.26-2.11-2.17-2.92-.13.07-.26.13-.4.18-.49.17-.99.17-1.46-.01-.47-.18-.86-.51-1.12-.93-.26-.42-.37-.91-.32-1.4.05-.49.26-.94.59-1.3C14.85 2.19 13.45 2 12 2zm-1.5 5c.83 0 1.5.67 1.5 1.5S11.33 10 10.5 10 9 9.33 9 8.5 9.67 7 10.5 7zM8 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4-3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
                  </svg>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-[15px] tracking-tight mb-1.5">
                    We value your privacy
                  </h3>
                  <p className="text-gray-400 text-[13px] leading-relaxed">
                    We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                    <span className="hidden sm:inline"> By clicking &quot;Accept All&quot;, you consent to our use of cookies.</span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setShowCustomize(true)}
                  className="group px-5 py-2.5 text-[13px] font-medium text-gray-300 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Customize
                  </span>
                </button>
                <button
                  onClick={handleRejectAll}
                  className="px-5 py-2.5 text-[13px] font-medium text-gray-300 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-200"
                >
                  Reject All
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2.5 text-[13px] font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl border border-blue-400/20 hover:from-blue-400 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-blue-500/20"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customize Modal - iOS style sheet */}
      {showCustomize && (
        <div 
          className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={(e) => e.target === e.currentTarget && setShowCustomize(false)}
        >
          <div 
            className="relative bg-[#1c1c1e] sm:rounded-2xl rounded-t-3xl shadow-2xl w-full sm:max-w-lg max-h-[85vh] overflow-hidden border border-white/10 animate-slide-up"
            style={{ 
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            {/* iOS-style handle for mobile */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-600" />
            </div>

            {/* Header */}
            <div className="px-6 pt-4 pb-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white tracking-tight">Privacy Settings</h2>
                  <p className="text-gray-500 text-sm mt-1">Manage your cookie preferences</p>
                </div>
                <button 
                  onClick={() => setShowCustomize(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Cookie Options */}
            <div className="px-6 py-4 space-y-3 overflow-y-auto max-h-[50vh]">
              {/* Essential Cookies */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <h3 className="text-white font-medium text-[15px]">Essential</h3>
                      <span className="text-[10px] font-medium text-emerald-400/80 bg-emerald-400/10 px-2 py-0.5 rounded-full">Required</span>
                    </div>
                    <p className="text-gray-500 text-[13px] mt-1.5 leading-relaxed">
                      Necessary for the website to function. Cannot be disabled.
                    </p>
                  </div>
                  <IOSToggle enabled={true} onChange={() => {}} disabled={true} />
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      <h3 className="text-white font-medium text-[15px]">Analytics</h3>
                    </div>
                    <p className="text-gray-500 text-[13px] mt-1.5 leading-relaxed">
                      Help us understand how visitors interact with our website.
                    </p>
                  </div>
                  <IOSToggle enabled={preferences.analytics} onChange={() => togglePreference('analytics')} />
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <h3 className="text-white font-medium text-[15px]">Marketing</h3>
                    </div>
                    <p className="text-gray-500 text-[13px] mt-1.5 leading-relaxed">
                      Used to display relevant advertisements based on your interests.
                    </p>
                  </div>
                  <IOSToggle enabled={preferences.marketing} onChange={() => togglePreference('marketing')} />
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <h3 className="text-white font-medium text-[15px]">Functional</h3>
                    </div>
                    <p className="text-gray-500 text-[13px] mt-1.5 leading-relaxed">
                      Enable personalized features like live chat and social sharing.
                    </p>
                  </div>
                  <IOSToggle enabled={preferences.functional} onChange={() => togglePreference('functional')} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-white/10 bg-black/20">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleRejectAll}
                  className="flex-1 px-5 py-3 text-[14px] font-medium text-gray-300 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                >
                  Reject All
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 px-5 py-3 text-[14px] font-medium text-white bg-white/10 rounded-xl border border-white/10 hover:bg-white/15 transition-all"
                >
                  Accept All
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 px-5 py-3 text-[14px] font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25 hover:from-blue-400 hover:to-blue-500 transition-all"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
