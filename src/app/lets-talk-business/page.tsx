"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const services = [
  "Web Development",
  "Mobile App Development",
  "Cloud Solutions",
  "AI/ML Solutions",
  "DevOps & CI/CD",
  "UI/UX Design",
  "E-commerce Solutions",
  "Custom Software",
  "Digital Marketing",
  "Maintenance & Support"
];

const budgetRanges = [
  "Less than $10,000",
  "$10,000 - $25,000",
  "$25,000 - $50,000",
  "$50,000 - $100,000",
  "$100,000 - $250,000",
  "$250,000+"
];

const timelineOptions = [
  "ASAP",
  "Within 1 month",
  "1-3 months",
  "3-6 months",
  "6+ months",
  "Not sure yet"
];

const benefits = [
  {
    icon: "clock",
    title: "Quick Response",
    description: "Get a response within 24 hours from our dedicated team"
  },
  {
    icon: "shield",
    title: "NDA Protection",
    description: "Your ideas are safe with our strict confidentiality agreements"
  },
  {
    icon: "users",
    title: "Expert Consultation",
    description: "Free consultation with our senior technical architects"
  },
  {
    icon: "chart",
    title: "Custom Proposal",
    description: "Detailed project proposal tailored to your requirements"
  }
];

const stats = [
  { value: "1000+", label: "Projects Delivered" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "50+", label: "Countries Served" },
  { value: "15+", label: "Years Experience" }
];

const BenefitIcon = ({ type }: { type: string }) => {
  const icons: { [key: string]: JSX.Element } = {
    clock: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />,
    shield: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />,
    users: <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />,
    chart: <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  };

  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      {icons[type]}
    </svg>
  );
};

export default function LetsTalkBusinessPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    service: "",
    budget: "",
    timeline: "",
    projectDetails: "",
    howDidYouHear: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
          

          <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 pt-32 pb-16 text-center">
            <div className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
              <div className="flex items-center gap-2 text-white/50 text-sm mb-8">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <span>›</span>
                <span className="text-white">Contact</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Let&apos;s Talk
              </h1>
              
              <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto">
                Tell us about your project, and our experts will craft a customized solution that drives real business results.
              </p>
            </div>
          </div>
        </section>


        {/* Main Content */}
        <section className="py-20">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              {/* Left Side - Form */}
              <div className="lg:col-span-2">
                {!submitted ? (
                  <div className={`bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                    <div className="mb-10">
                      <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e] mb-3">
                        Tell Us About Your Project
                      </h2>
                      <p className="text-gray-600">
                        Fill out the form below and we&apos;ll get back to you within 24 hours with a customized proposal.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                      {/* Personal Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2">
                          <span className="w-8 h-8 bg-[#262b3f] rounded-full flex items-center justify-center text-white text-sm">1</span>
                          Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                            <input
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#262b3f] focus:ring-2 focus:ring-[#262b3f]/20 transition-all"
                              placeholder="John"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                            <input
                              type="text"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#262b3f] focus:ring-2 focus:ring-[#262b3f]/20 transition-all"
                              placeholder="Doe"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Work Email *</label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#262b3f] focus:ring-2 focus:ring-[#262b3f]/20 transition-all"
                              placeholder="john@company.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#262b3f] focus:ring-2 focus:ring-[#262b3f]/20 transition-all"
                              placeholder="+1 (555) 000-0000"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Company Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2">
                          <span className="w-8 h-8 bg-[#262b3f] rounded-full flex items-center justify-center text-white text-sm">2</span>
                          Company Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                            <input
                              type="text"
                              name="company"
                              value={formData.company}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#262b3f] focus:ring-2 focus:ring-[#262b3f]/20 transition-all"
                              placeholder="Acme Inc."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Role</label>
                            <input
                              type="text"
                              name="jobTitle"
                              value={formData.jobTitle}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#262b3f] focus:ring-2 focus:ring-[#262b3f]/20 transition-all"
                              placeholder="CTO, Product Manager, etc."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Project Details */}
                      <div>
                        <h3 className="text-lg font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2">
                          <span className="w-8 h-8 bg-[#262b3f] rounded-full flex items-center justify-center text-white text-sm">3</span>
                          Project Information
                        </h3>
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Service Required *</label>
                            <select
                              name="service"
                              value={formData.service}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#262b3f] focus:ring-2 focus:ring-[#262b3f]/20 transition-all bg-white"
                            >
                              <option value="">Select a service</option>
                              {services.map((service) => (
                                <option key={service} value={service}>{service}</option>
                              ))}
                            </select>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Budget</label>
                              <select
                                name="budget"
                                value={formData.budget}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#262b3f] focus:ring-2 focus:ring-[#262b3f]/20 transition-all bg-white"
                              >
                                <option value="">Select budget range</option>
                                {budgetRanges.map((range) => (
                                  <option key={range} value={range}>{range}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Project Timeline</label>
                              <select
                                name="timeline"
                                value={formData.timeline}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#262b3f] focus:ring-2 focus:ring-[#262b3f]/20 transition-all bg-white"
                              >
                                <option value="">Select timeline</option>
                                {timelineOptions.map((option) => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Project Details *</label>
                            <textarea
                              name="projectDetails"
                              value={formData.projectDetails}
                              onChange={handleChange}
                              required
                              rows={5}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#262b3f] focus:ring-2 focus:ring-[#262b3f]/20 transition-all resize-none"
                              placeholder="Tell us about your project goals, challenges, and what success looks like for you..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">How did you hear about us?</label>
                            <input
                              type="text"
                              name="howDidYouHear"
                              value={formData.howDidYouHear}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#262b3f] focus:ring-2 focus:ring-[#262b3f]/20 transition-all"
                              placeholder="Google, Referral, LinkedIn, etc."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-6">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-[#262b3f] hover:bg-[#0055FF] text-white py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Submitting...
                            </>
                          ) : (
                            <>
                              Submit Your Inquiry
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </>
                          )}
                        </button>
                        <p className="text-center text-gray-500 text-sm mt-4">
                          By submitting, you agree to our <Link href="#" className="text-[#262b3f] hover:underline">Privacy Policy</Link> and <Link href="#" className="text-[#262b3f] hover:underline">Terms of Service</Link>
                        </p>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
                    <div className="w-20 h-20 bg-[#262b3f] rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-[#1a1a2e] mb-4">Thank You!</h2>
                    <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                      Your inquiry has been received. Our team will review your project details and get back to you within 24 hours.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link
                        href="/"
                        className="px-8 py-3 bg-[#262b3f] hover:bg-[#0055FF] text-white rounded-xl font-medium transition-all"
                      >
                        Back to Home
                      </Link>
                      <Link
                        href="/services"
                        className="px-8 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:border-[#262b3f] hover:text-[#262b3f] transition-all"
                      >
                        Explore Services
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side - Info */}
              <div className="lg:col-span-1 space-y-8">
                {/* Benefits */}
                <div className={`bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-3xl p-8 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                  <h3 className="text-xl font-semibold text-white mb-6">What You&apos;ll Get</h3>
                  <div className="space-y-6">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#262b3f]/20 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                          <BenefitIcon type={benefit.icon} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-1">{benefit.title}</h4>
                          <p className="text-white/60 text-sm">{benefit.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div className={`bg-white rounded-3xl border border-gray-100 shadow-lg p-8 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                  <h3 className="text-xl font-semibold text-[#1a1a2e] mb-6">Prefer to Talk?</h3>
                  <div className="space-y-4">
                    <a href="mailto:hello@vyntechsolutions.ca" className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-[#262b3f]/5 transition-colors group">
                      <div className="w-10 h-10 bg-[#262b3f]/10 rounded-lg flex items-center justify-center text-[#262b3f] group-hover:bg-[#262b3f] group-hover:text-white transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Email Us</div>
                        <div className="font-medium text-[#1a1a2e]">info@vyntechsolutions.ca</div>
                      </div>
                    </a>
                    <a href="tel:+1234567890" className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-[#262b3f]/5 transition-colors group">
                      <div className="w-10 h-10 bg-[#262b3f]/10 rounded-lg flex items-center justify-center text-[#262b3f] group-hover:bg-[#262b3f] group-hover:text-white transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Call Us</div>
                        <div className="font-medium text-[#1a1a2e]">+1 (234) 567-890</div>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Office Hours */}
                <div className={`bg-gray-50 rounded-3xl p-8 transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                  <h3 className="text-lg font-semibold text-[#1a1a2e] mb-4">Office Hours</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monday - Friday</span>
                      <span className="font-medium text-[#1a1a2e]">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Saturday</span>
                      <span className="font-medium text-[#1a1a2e]">10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sunday</span>
                      <span className="font-medium text-gray-400">Closed</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">* All times are in EST (UTC-5)</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
