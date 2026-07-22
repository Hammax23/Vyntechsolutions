"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function TimedCTAPopup() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [promoHeading, setPromoHeading] = useState("Share Your Requirements");
  const [promoBody, setPromoBody] = useState(
    "to help our experts understand your business objectives and create your customized plan."
  );
  const [formData, setFormData] = useState({
    name: "",
    companyEmail: "",
    phoneCode: "+1",
    phoneNumber: "",
    workEmail: "",
    projectDescription: "",
  });

  const hideWidgets =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/seopanel") ||
    pathname?.startsWith("/quote");

  useEffect(() => {
    if (hideWidgets) return;
    fetch("/api/cms/content?type=promos&slot=timed-cta")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const promo = data?.promos?.[0];
        if (promo?.heading) setPromoHeading(String(promo.heading));
        if (promo?.body) setPromoBody(String(promo.body));
      })
      .catch(() => {});
  }, [hideWidgets]);

  useEffect(() => {
    // Don't show on admin / quote pages
    if (hideWidgets) return;
    
    // Check if popup was already shown in this session
    const alreadyShown = sessionStorage.getItem("ctaPopupShown");
    if (alreadyShown) {
      setHasShown(true);
      return;
    }

    // Show popup after 1 minute (60000ms)
    const timer = setTimeout(() => {
      if (!hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem("ctaPopupShown", "true");
      }
    }, 60000);

    return () => clearTimeout(timer);
  }, [hasShown, hideWidgets]);

  // Hide on admin / SEO panel / client quote pages
  if (hideWidgets) {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("CTA Form submitted:", formData);
    setIsVisible(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 z-10"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="p-5 sm:p-8 md:p-10">
            {/* Header */}
            <div className="mb-5 sm:mb-8 pr-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 leading-relaxed">
                <span className="text-gray-900">{promoHeading}</span>{" "}
                <span className="text-gray-500 font-normal">
                  {promoBody}
                </span>
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Row 1: Name & Company Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Name"
                    required
                    className="w-full px-0 py-3 text-gray-900 placeholder-gray-400 border-0 border-b-2 border-gray-200 focus:border-[#1a1a2e] focus:ring-0 transition-colors duration-200 bg-transparent text-base"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="companyEmail"
                    value={formData.companyEmail}
                    onChange={handleChange}
                    placeholder="Company Email"
                    required
                    className="w-full px-0 py-3 text-gray-900 placeholder-gray-400 border-0 border-b-2 border-gray-200 focus:border-[#1a1a2e] focus:ring-0 transition-colors duration-200 bg-transparent text-base"
                  />
                </div>
              </div>

              {/* Row 2: Contact Number & Work Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex gap-2">
                  <select
                    name="phoneCode"
                    value={formData.phoneCode}
                    onChange={handleChange}
                    className="w-20 px-2 py-3 text-gray-600 border-0 border-b-2 border-gray-200 focus:border-[#1a1a2e] focus:ring-0 transition-colors duration-200 bg-transparent text-sm cursor-pointer"
                  >
                    <option value="+1">+1</option>
                    <option value="+92">+92</option>
                    <option value="+44">+44</option>
                    <option value="+91">+91</option>
                    <option value="+971">+971</option>
                    <option value="+61">+61</option>
                    <option value="+49">+49</option>
                    <option value="+33">+33</option>
                  </select>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Contact Number"
                    required
                    className="flex-1 px-0 py-3 text-gray-900 placeholder-gray-400 border-0 border-b-2 border-gray-200 focus:border-[#1a1a2e] focus:ring-0 transition-colors duration-200 bg-transparent text-base"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="workEmail"
                    value={formData.workEmail}
                    onChange={handleChange}
                    placeholder="Work Email (Optional)"
                    className="w-full px-0 py-3 text-gray-900 placeholder-gray-400 border-0 border-b-2 border-gray-200 focus:border-[#1a1a2e] focus:ring-0 transition-colors duration-200 bg-transparent text-base"
                  />
                </div>
              </div>

              {/* Row 3: Project Description */}
              <div>
                <textarea
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleChange}
                  placeholder="Describe your project (Help us come back better prepared)"
                  rows={3}
                  className="w-full px-0 py-3 text-gray-900 placeholder-gray-400 border-0 border-b-2 border-gray-200 focus:border-[#1a1a2e] focus:ring-0 transition-colors duration-200 bg-transparent text-sm sm:text-base resize-none"
                />
              </div>

              {/* Trust Badge */}
              <div className="flex items-center gap-3 bg-amber-50 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 mt-4 sm:mt-6">
                <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700 text-xs sm:text-sm">
                  Fast 2-minute response, fully <span className="font-semibold">NDA-protected</span>.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#1a1a2e] hover:bg-[#262b3f] text-white py-3 sm:py-4 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base mt-3 sm:mt-4"
              >
                Submit Requirements
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
