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

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-white py-12">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gradient-to-r from-[#00E1FF]/10 to-[#0055FF]/10 text-[#0055FF] font-semibold text-sm mb-6 tracking-wide border border-[#00E1FF]/30">
            GOT QUESTIONS?
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-4">
            Frequently Asked <span className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">Questions</span>
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about the product and how we work. Can&apos;t find the answer you&apos;re looking for? Please chat to our team.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-2.5">
          {faqData.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={`border rounded-lg transition-all duration-200 overflow-hidden ${
                  isOpen ? "border-[#0055FF] bg-white shadow-sm" : "border-gray-200 bg-gray-50/50 hover:bg-gray-50"
                }`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left focus:outline-none"
                >
                  <span className={`font-semibold text-sm sm:text-base transition-colors ${
                    isOpen ? "text-[#0055FF]" : "text-[#1a1a2e]"
                  }`}>
                    {faq.question}
                  </span>
                  <div className={`ml-4 shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isOpen ? "bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                    <svg 
                      className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`} 
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
                  className={`px-4 overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[500px] opacity-100 pb-4" : "max-h-0 opacity-0 pb-0"
                  }`}
                >
                  <p className="text-gray-600 leading-relaxed text-xs sm:text-sm">
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
