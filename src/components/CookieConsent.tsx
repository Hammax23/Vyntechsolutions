"use client";

import { useState, useEffect } from "react";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
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
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    localStorage.setItem("cookieConsent", JSON.stringify(allAccepted));
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    localStorage.setItem("cookieConsent", JSON.stringify(essentialOnly));
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("cookieConsent", JSON.stringify(preferences));
    setShowCustomize(false);
    setIsVisible(false);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "essential") return;
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Main Banner */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-[9999] bg-[#1a1a2e] border-t border-gray-700 shadow-2xl transition-transform duration-300 ${showCustomize ? 'translate-y-full' : 'translate-y-0'}`}
        style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-white font-semibold text-sm mb-1">
                We value your privacy
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowCustomize(true)}
                className="px-4 py-2 text-xs font-medium text-white bg-transparent border border-gray-600 rounded hover:bg-gray-700 transition-colors"
              >
                Customize
              </button>
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-xs font-medium text-white bg-transparent border border-gray-600 rounded hover:bg-gray-700 transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-xs font-medium text-white bg-[#FF6B35] border border-[#FF6B35] rounded hover:bg-[#e55a2b] transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customize Modal */}
      {showCustomize && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div 
            className="bg-[#1a1a2e] rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-700"
            style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Cookie Preferences</h2>
                <button 
                  onClick={() => setShowCustomize(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Manage your cookie preferences. You can enable or disable different types of cookies below.
              </p>
            </div>

            {/* Cookie Options */}
            <div className="p-5 space-y-4">
              {/* Essential Cookies */}
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="text-white font-medium text-sm">Essential Cookies</h3>
                    <p className="text-gray-400 text-xs mt-1">
                      Required for the website to function properly. Cannot be disabled.
                    </p>
                  </div>
                  <div className="relative">
                    <div className="w-11 h-6 bg-[#FF6B35] rounded-full cursor-not-allowed opacity-70">
                      <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="text-white font-medium text-sm">Analytics Cookies</h3>
                    <p className="text-gray-400 text-xs mt-1">
                      Help us understand how visitors interact with our website by collecting anonymous data.
                    </p>
                  </div>
                  <button 
                    onClick={() => togglePreference('analytics')}
                    className="relative shrink-0"
                  >
                    <div className={`w-11 h-6 rounded-full transition-colors ${preferences.analytics ? 'bg-[#FF6B35]' : 'bg-gray-600'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${preferences.analytics ? 'right-0.5' : 'left-0.5'}`}></div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="text-white font-medium text-sm">Marketing Cookies</h3>
                    <p className="text-gray-400 text-xs mt-1">
                      Used to track visitors across websites to display relevant advertisements.
                    </p>
                  </div>
                  <button 
                    onClick={() => togglePreference('marketing')}
                    className="relative shrink-0"
                  >
                    <div className={`w-11 h-6 rounded-full transition-colors ${preferences.marketing ? 'bg-[#FF6B35]' : 'bg-gray-600'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${preferences.marketing ? 'right-0.5' : 'left-0.5'}`}></div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="text-white font-medium text-sm">Functional Cookies</h3>
                    <p className="text-gray-400 text-xs mt-1">
                      Enable personalized features like live chat, videos, and social media sharing.
                    </p>
                  </div>
                  <button 
                    onClick={() => togglePreference('functional')}
                    className="relative shrink-0"
                  >
                    <div className={`w-11 h-6 rounded-full transition-colors ${preferences.functional ? 'bg-[#FF6B35]' : 'bg-gray-600'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${preferences.functional ? 'right-0.5' : 'left-0.5'}`}></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-700 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRejectAll}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-transparent border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={handleAcceptAll}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gray-600 border border-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={handleSavePreferences}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#FF6B35] border border-[#FF6B35] rounded-lg hover:bg-[#e55a2b] transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
