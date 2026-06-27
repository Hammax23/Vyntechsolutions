"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

const regions = [
  "Select Region",
  "North America",
  "Europe",
  "Asia Pacific",
  "Middle East",
  "Africa",
  "South America",
];

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

const jobOptions = [
  "Please Select",
  "Yes",
  "No",
];

export default function LetsTalkBusiness() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneCode: "+1",
    phoneNumber: "",
    companyName: "",
    companyUrl: "",
    services: [] as string[],
    projectDetails: "",
    hearAbout: "",
  });

  const isAdminPage = pathname?.startsWith('/admin') || pathname?.startsWith('/seopanel');

  // Listen for custom event to open the panel
  useEffect(() => {
    if (isAdminPage) return;
    const handleOpenPanel = () => setIsOpen(true);
    window.addEventListener('openLetsTalkBusiness', handleOpenPanel);
    return () => window.removeEventListener('openLetsTalkBusiness', handleOpenPanel);
  }, [isAdminPage]);

  // Hide on admin pages
  if (isAdminPage) {
    return null;
  }

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/send-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: `${formData.phoneCode} ${formData.phoneNumber}`,
          companyName: formData.companyName,
          companyUrl: formData.companyUrl,
          services: formData.services,
          projectDetails: formData.projectDetails,
          hearAbout: formData.hearAbout,
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form after success
        setFormData({
          fullName: "",
          email: "",
          phoneCode: "+1",
          phoneNumber: "",
          companyName: "",
          companyUrl: "",
          services: [],
          projectDetails: "",
          hearAbout: "",
        });
        // Close panel after 3 seconds
        setTimeout(() => {
          setIsOpen(false);
          setSubmitStatus('idle');
        }, 3000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Side Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-gradient-to-b from-[#00E1FF] via-[#0055FF] to-[#FF6B6B] hover:opacity-90 text-white py-6 px-2 rounded-l-md shadow-lg transition-all duration-300 group overflow-hidden"
        style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
      >
        <span className="text-sm font-semibold tracking-wider whitespace-nowrap">
          Let&apos;s Talk Business
        </span>
      </button>


      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Slide-out Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl transform transition-transform duration-500 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Let&apos;s Talk Business</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Contact Info - Simple inline */}
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <a 
              href="mailto:info@vyntechsolutions.ca"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-[#0055FF] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              info@vyntechsolutions.ca
            </a>
            <span className="text-gray-300">|</span>
            <a 
              href="tel:+14168935779"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-[#0055FF] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              +1 (416) 893-5779
            </a>
          </div>
        </div>

        {/* Form */}
        <div className="h-[calc(100%-80px)] overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] focus:border-transparent outline-none transition-all text-gray-900 bg-white"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] focus:border-transparent outline-none transition-all text-gray-900 bg-white"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number<span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-3 border border-gray-300 rounded-lg bg-gray-50">
                  <Image src="https://flagcdn.com/w40/ca.png" alt="Canada" width={24} height={16} className="object-cover rounded-sm" />
                  <span className="text-sm font-medium text-gray-900">+1</span>
                </div>
                <input
                  type="tel"
                  required
                  placeholder="(201) 555-0123"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] focus:border-transparent outline-none transition-all text-gray-900 bg-white"
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] focus:border-transparent outline-none transition-all text-gray-900 bg-white"
              />
            </div>

            {/* Company URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company URL
              </label>
              <input
                type="url"
                value={formData.companyUrl}
                onChange={(e) => setFormData({ ...formData, companyUrl: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] focus:border-transparent outline-none transition-all text-gray-900 bg-white"
              />
            </div>

            {/* Services */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Services you are looking for<span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {services.map((service) => (
                  <label
                    key={service}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div
                      className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                        formData.services.includes(service)
                          ? "bg-[#0d9488] border-[#0d9488]"
                          : "border-gray-300 group-hover:border-[#0d9488]"
                      }`}
                    >
                      {formData.services.includes(service) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.services.includes(service)}
                      onChange={() => handleServiceToggle(service)}
                    />
                    <span className="text-sm text-gray-700">{service}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Project Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Details<span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={formData.projectDetails}
                onChange={(e) => setFormData({ ...formData, projectDetails: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] focus:border-transparent outline-none transition-all resize-none text-gray-900 bg-white"
              />
            </div>

            {/* How did you hear about us */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How did you hear about us?
              </label>
              <select
                value={formData.hearAbout || ""}
                onChange={(e) => setFormData({ ...formData, hearAbout: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] focus:border-transparent outline-none transition-all bg-white cursor-pointer text-gray-900"
              >
                <option value="" className="text-gray-900 bg-white">Please Select</option>
                <option value="Google Search" className="text-gray-900 bg-white">Google Search</option>
                <option value="Social Media" className="text-gray-900 bg-white">Social Media</option>
                <option value="Referral" className="text-gray-900 bg-white">Referral</option>
                <option value="Event/Conference" className="text-gray-900 bg-white">Event/Conference</option>
                <option value="Advertisement" className="text-gray-900 bg-white">Advertisement</option>
                <option value="Other" className="text-gray-900 bg-white">Other</option>
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

            {/* Success Message */}
            {submitStatus === 'success' && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-green-800 font-semibold">Quote Submitted Successfully!</p>
                  <p className="text-green-600 text-sm">Check your email for confirmation.</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitStatus === 'error' && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-red-800 font-semibold">Something went wrong</p>
                  <p className="text-red-600 text-sm">Please try again or email us directly.</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || submitStatus === 'success'}
              className={`w-full py-4 bg-gradient-to-r from-[#00E1FF] via-[#0055FF] to-[#FF6B6B] text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                isSubmitting || submitStatus === 'success' ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : submitStatus === 'success' ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Submitted!
                </>
              ) : (
                'Submit'
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
