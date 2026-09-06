"use client";

import { useState } from "react";

interface CityFAQItem {
  question: string;
  answer: string;
}

interface CityFAQProps {
  formattedCity: string;
  serviceTitle: string;
  faqs?: CityFAQItem[];
  eyebrow?: string;
  heading?: string;
  intro?: string;
}

export default function CityFAQ({
  formattedCity,
  serviceTitle,
  faqs,
  eyebrow = "FAQ",
  heading = "Frequently asked questions",
  intro,
}: CityFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData = faqs && faqs.length > 0 ? faqs : [];

  return (
    <section className="w-full bg-white py-16 md:py-24 border-t border-slate-100">
      <div className="max-w-[760px] mx-auto px-5 sm:px-6">
        <div className="text-center mb-12 md:mb-14">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#0055FF] mb-3">
            {eyebrow}
          </p>
          <h2 className="text-[28px] sm:text-4xl font-semibold tracking-tight text-[#0f172a] mb-3">
            {heading}
          </h2>
          <p className="text-slate-500 text-[15px] sm:text-base max-w-xl mx-auto leading-relaxed">
            {intro || `Everything you need to know about our ${serviceTitle} services in ${formattedCity}.`}
          </p>
        </div>

        <div className="border-t border-slate-200">
          {faqData.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  aria-expanded={isOpen}
                  className="w-full flex items-start justify-between gap-6 py-5 text-left group"
                >
                  <span
                    className={`text-[15px] sm:text-base font-medium leading-snug transition-colors ${
                      isOpen ? "text-[#0f172a]" : "text-slate-800 group-hover:text-[#0055FF]"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <span
                    className={`mt-0.5 shrink-0 w-5 h-5 relative ${
                      isOpen ? "text-[#0055FF]" : "text-slate-400 group-hover:text-[#0055FF]"
                    }`}
                    aria-hidden
                  >
                    <span className="absolute left-1/2 top-1/2 h-[1.5px] w-3 -translate-x-1/2 -translate-y-1/2 bg-current rounded-full" />
                    <span
                      className={`absolute left-1/2 top-1/2 h-3 w-[1.5px] -translate-x-1/2 -translate-y-1/2 bg-current rounded-full transition-transform duration-200 ${
                        isOpen ? "scale-y-0" : "scale-y-100"
                      }`}
                    />
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    isOpen ? "max-h-[420px] opacity-100 pb-5" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-slate-500 text-[14px] sm:text-[15px] leading-relaxed pr-8">
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
