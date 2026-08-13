"use client";

import { useState } from "react";

const faqData = [
  {
    question: "What services does VynTech Solutions provide?",
    answer: "We offer end-to-end digital solutions including Web & Mobile App Development, UI/UX Design, Cloud Infrastructure, AI & Machine Learning, E-commerce Solutions, and Custom Enterprise Software."
  },
  {
    question: "How long does a typical project take to complete?",
    answer: "The timeline varies depending on the project's scope and complexity. A standard web application might take 4-8 weeks, while complex enterprise solutions can take 3-6 months. We provide detailed timelines during the discovery phase."
  },
  {
    question: "Do you offer post-launch support and maintenance?",
    answer: "Yes, we provide comprehensive post-launch support and maintenance packages. This includes regular security updates, performance monitoring, bug fixes, and feature enhancements to keep your application running smoothly."
  },
  {
    question: "How do you ensure the security of our data and applications?",
    answer: "Security is our top priority. We implement industry best practices, including data encryption, secure authentication (OAuth/JWT), regular vulnerability assessments, and compliance with standards like GDPR and HIPAA where applicable."
  },
  {
    question: "Can you integrate with our existing software and tools?",
    answer: "Absolutely. We have extensive experience building seamless integrations with various third-party APIs, CRM systems (Salesforce, HubSpot), payment gateways, and enterprise software to ensure your systems communicate effectively."
  },
  {
    question: "Will I have a dedicated project manager?",
    answer: "Yes, every project is assigned a dedicated project manager who serves as your primary point of contact. They ensure clear communication, track progress, and make sure the project is delivered on time and within budget."
  },
  {
    question: "What is your pricing model?",
    answer: "We offer flexible pricing models based on your needs: Fixed-Price for well-defined projects, Time & Material for ongoing development with evolving requirements, and Dedicated Teams for long-term engagements."
  },
  {
    question: "Do you sign Non-Disclosure Agreements (NDAs)?",
    answer: "Yes, we are fully committed to protecting your intellectual property. We are happy to sign NDAs before any project discussions begin to ensure your ideas and data remain strictly confidential."
  },
  {
    question: "What industries do you specialize in?",
    answer: "We have successfully delivered solutions across various industries including Healthcare, Finance (FinTech), E-commerce, Education (EdTech), Real Estate, and Logistics. Our adaptable expertise allows us to understand and solve domain-specific challenges."
  },
  {
    question: "How do we get started?",
    answer: "Getting started is easy! Simply reach out to us via our contact form or book a free consultation. We'll discuss your requirements, propose a tailored solution, and outline the next steps to kick off your project."
  }
];

export default function FAQ({ faqs }: { faqs?: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const displayFaqs = faqs && faqs.length > 0 ? faqs : faqData;

  if (!displayFaqs || displayFaqs.length === 0) return null;

  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="max-w-[760px] mx-auto px-5 sm:px-6">
        <div className="text-center mb-12 md:mb-14">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#0055FF] mb-3">
            FAQ
          </p>
          <h2 className="text-[28px] sm:text-4xl font-semibold tracking-tight text-[#0f172a] mb-3">
            Frequently asked questions
          </h2>
          <p className="text-slate-500 text-[15px] sm:text-base max-w-xl mx-auto leading-relaxed">
            Answers about how we work, timelines, and delivery. Still stuck? Chat with the team.
          </p>
        </div>

        <div className="border-t border-slate-200">
          {displayFaqs.map((faq, index) => {
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
