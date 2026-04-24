"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

const services = [
  "Web Development",
  "Custom Software Development",
  "Mobile App Development",
  "Cloud Solutions",
  "AI/ML Solutions",
  "DevOps & CI/CD",
  "UI/UX Design",
  "E-commerce Solutions",
  "SEO/Digital Marketing",
  "Maintenance & Support",
  "Tax & Accounting",
];

const regions = [
  "Select Region",
  "North America",
  "South America",
  "Europe",
  "Asia Pacific",
  "Middle East",
  "Africa",
];

const hearAboutUs = [
  "Please Select",
  "Google Search",
  "Social Media",
  "Referral",
  "Event/Conference",
  "Advertisement",
  "Other",
];

export default function GetInTouch() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    companyUrl: "",
    region: "",
    projectDetails: "",
    hearAbout: "",
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleServiceToggle = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ ...formData, services: selectedServices });
  };

  return (
    <section
      ref={sectionRef}
      className="w-full bg-[#f8f9fa] py-16 sm:py-20 md:py-24 lg:py-28 relative overflow-hidden"
    >
      {/* Floating Contact Icons Animation - Top Right */}
      <div className="absolute top-8 right-8 sm:top-12 sm:right-12 md:top-16 md:right-24 hidden md:flex flex-col gap-4 items-end">
        {/* Email Icon - floating up and down */}
        <div className="animate-bounce" style={{ animationDuration: '2s' }}>
          <div className="w-14 h-14 bg-[#0d9488]/10 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-[#0d9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
        </div>
        
        {/* Phone Icon - pulse effect */}
        <div className="animate-pulse mr-8">
          <div className="w-12 h-12 bg-[#f97316]/10 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-[#f97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
          </div>
        </div>
        
        {/* Chat Icon - floating with delay */}
        <div className="animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
          <div className="w-16 h-16 bg-[#0d9488]/10 rounded-full flex items-center justify-center mr-4">
            <svg className="w-8 h-8 text-[#0d9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
        </div>
        
        {/* Connection dots animation */}
        <div className="absolute top-12 right-16 flex gap-1">
          <div className="w-2 h-2 bg-[#0d9488] rounded-full animate-ping" style={{ animationDuration: '1.5s' }} />
          <div className="w-2 h-2 bg-[#0d9488] rounded-full animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.3s' }} />
          <div className="w-2 h-2 bg-[#0d9488] rounded-full animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.6s' }} />
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
        {/* Heading */}
        <h2
          className={`text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] font-bold leading-tight tracking-tight text-center mb-12 sm:mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="bg-gradient-to-tr from-[#0055FF] via-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(0,180,255,0.2)]">G</span>
          <span className="text-gray-900">et</span>
          <span className="bg-gradient-to-tr from-[#0055FF] via-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(0,180,255,0.2)]"> I</span>
          <span className="text-gray-900">n</span>
          <span className="bg-gradient-to-tr from-[#0055FF] via-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(0,180,255,0.2)]"> T</span>
          <span className="text-gray-900">ouch</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Left Side - Contact Form */}
          <div
            className={`lg:col-span-2 transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Full Name*</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full border-b border-gray-300 py-2 focus:border-[#0d9488] focus:outline-none transition-colors text-gray-900 bg-transparent"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border-b border-gray-300 py-2 focus:border-[#0d9488] focus:outline-none transition-colors text-gray-900 bg-transparent"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Phone Number*</label>
                <div className="flex items-center border-b border-gray-300">
                  <span className="text-gray-600 pr-2 flex items-center gap-2">
                    <Image src="https://flagcdn.com/w40/ca.png" alt="Canada" width={24} height={16} className="object-cover rounded-sm" />
                    <span className="text-sm font-medium">+1</span>
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(201) 555-0123"
                    className="flex-1 py-2 focus:outline-none text-gray-900 bg-transparent"
                    required
                  />
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Company Name*</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full border-b border-gray-300 py-2 focus:border-[#0d9488] focus:outline-none transition-colors text-gray-900 bg-transparent"
                  required
                />
              </div>

              {/* Company URL */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Company URL</label>
                <input
                  type="url"
                  name="companyUrl"
                  value={formData.companyUrl}
                  onChange={handleInputChange}
                  className="w-full border-b border-gray-300 py-2 focus:border-[#0d9488] focus:outline-none transition-colors text-gray-900 bg-transparent"
                />
              </div>

              {/* Services Checkboxes */}
              <div>
                <label className="block text-xs text-gray-500 mb-3">Services you are looking for*</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {services.map((service) => (
                    <label
                      key={service}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <div
                        className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${
                          selectedServices.includes(service)
                            ? "bg-[#0d9488] border-[#0d9488]"
                            : "border-gray-300 group-hover:border-[#0d9488]"
                        }`}
                      >
                        {selectedServices.includes(service) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                        className="hidden"
                      />
                      <span className="text-sm text-gray-700">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Project Details */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Project Details*</label>
                <textarea
                  name="projectDetails"
                  value={formData.projectDetails}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md p-3 focus:border-[#0d9488] focus:outline-none transition-colors resize-none text-gray-900 bg-white"
                  required
                />
              </div>

              {/* How did you hear about us */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">How did you hear about us?</label>
                <select
                  name="hearAbout"
                  value={formData.hearAbout}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:border-[#0d9488] focus:outline-none transition-colors bg-white appearance-none cursor-pointer text-gray-900"
                >
                  {hearAboutUs.map((option) => (
                    <option key={option} value={option === "Please Select" ? "" : option} className="text-gray-900 bg-white">
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Consent Checkbox */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="mt-0.5">
                    <input
                      type="checkbox"
                      name="agreeToUpdates"
                      className="w-4 h-4 border-2 border-gray-300 rounded accent-[#0d9488] cursor-pointer"
                    />
                  </div>
                  <span className="text-sm text-gray-600 leading-relaxed">
                    I agree to receive email and SMS updates about my quote request.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="bg-gradient-to-r from-[#0055FF] via-[#00B4FF] to-[#00E1FF] hover:opacity-90 text-white font-semibold py-3 px-8 rounded-md transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Submit
              </button>
            </form>
          </div>

          {/* Right Side - Why Choose Us */}
          <div
            className={`space-y-6 transition-all duration-700 delay-400 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            {/* Why Partner With Us */}
            <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-2xl p-6 text-white shadow-xl border border-white/5">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Why Partner With Us
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>10+ Years of Industry Experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>500+ Projects Delivered Successfully</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>98% Client Satisfaction Rate</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>24/7 Dedicated Support Team</span>
                </li>
              </ul>
            </div>

            {/* Response Time Guarantee */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0d9488]/10 to-[#0d9488]/20 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-[#0d9488]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Quick Response</h3>
                  <p className="text-sm text-gray-500">We value your time</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Our team responds to all inquiries within <span className="font-semibold text-[#0d9488]">24 hours</span>. Get a free consultation and project estimate.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No commitment required</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Trusted By</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 flex items-center justify-center shadow-sm">
                  <Image 
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" 
                    alt="Google" 
                    width={32}
                    height={32}
                    className="opacity-70 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="bg-white rounded-lg p-4 flex items-center justify-center shadow-sm">
                  <Image 
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" 
                    alt="AWS" 
                    width={32}
                    height={32}
                    className="opacity-70 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="bg-white rounded-lg p-4 flex items-center justify-center shadow-sm">
                  <Image 
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg" 
                    alt="Microsoft Azure" 
                    width={32}
                    height={32}
                    className="opacity-70 hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">
                Certified & verified technology partner
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
