"use client";

import { useState } from "react";

interface CityFAQProps {
  formattedCity: string;
  serviceTitle: string;
}

export default function CityFAQ({ formattedCity, serviceTitle }: CityFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData = [
    {
      question: `Why do I need professional ${serviceTitle} services in ${formattedCity}?`,
      answer: `${formattedCity} is a highly competitive market. Having a professional ${serviceTitle} strategy ensures your business stands out locally, attracts the right audience, and converts visitors into loyal customers.`
    },
    {
      question: `How long does a typical ${serviceTitle} project take?`,
      answer: "The timeline depends on the scope and complexity of your requirements. Once we evaluate your business goals during our free consultation, we provide a clear, transparent timeline with milestones."
    },
    {
      question: `Do you have experience working with businesses in ${formattedCity}?`,
      answer: `Yes, we have extensive experience working with companies across ${formattedCity} in various industries. We understand the local market dynamics and tailor our strategies to match regional consumer behavior.`
    },
    {
      question: `What makes VynTech Solutions different from other agencies in ${formattedCity}?`,
      answer: "We don't just deliver a service; we act as your technology partner. Our team focuses on ROI-driven results, transparent communication, and building long-term scalable solutions for your business."
    },
    {
      question: "How do we get started?",
      answer: "Getting started is easy! Simply reach out to us using the 'Let's Talk Business' button below. We'll schedule a free consultation to discuss your needs and outline the perfect strategy."
    }
  ];

  return (
    <section className="w-full bg-white py-16 lg:py-24 border-t border-gray-100">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gradient-to-r from-[#00E1FF]/10 to-[#0055FF]/10 text-[#0055FF] font-semibold text-sm mb-6 tracking-wide border border-[#00E1FF]/30">
            GOT QUESTIONS?
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-4">
            Frequently Asked <span className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">Questions</span>
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about our {serviceTitle} services in {formattedCity}.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqData.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={`border rounded-xl transition-all duration-300 overflow-hidden ${
                  isOpen ? "border-[#0055FF] bg-white shadow-md shadow-[#0055FF]/5" : "border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200"
                }`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left focus:outline-none"
                >
                  <span className={`font-bold text-sm sm:text-base transition-colors ${
                    isOpen ? "text-[#0055FF]" : "text-[#1a1a2e]"
                  }`}>
                    {faq.question}
                  </span>
                  <div className={`ml-4 shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isOpen ? "bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-white shadow-sm" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                  }`}>
                    <svg 
                      className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <div 
                  className={`px-5 overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[500px] opacity-100 pb-5" : "max-h-0 opacity-0 pb-0"
                  }`}
                >
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
