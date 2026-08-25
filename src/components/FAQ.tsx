"use client";

import { useEffect, useState } from "react";

export const HOME_FAQS = [
  {
    question: "What other services do you provide?",
    answer:
      "Beyond web development, we offer mobile app development, UI/UX design, SEO, custom software, cloud solutions, and ongoing maintenance.",
  },
  {
    question: "Do you provide customized website design services?",
    answer:
      "Yes, every website is built from scratch around your brand and goals, no generic templates.",
  },
  {
    question: "Are you an e-commerce website development company?",
    answer:
      "Yes, we build e-commerce platforms on Shopify, WooCommerce, and custom stacks, from catalogs to payment integration.",
  },
  {
    question: "Do you offer small business website development?",
    answer:
      "Absolutely. We build websites for businesses of every size, including budget-friendly options for small businesses.",
  },
  {
    question: "What makes you one of the best website development companies in Toronto?",
    answer:
      "Transparent communication, strong technical expertise, and results, 50+ projects delivered.",
  },
  {
    question: "Where can I learn more about your company and team?",
    answer: "Visit our About Us page to learn our mission, values, and story.",
  },
  {
    question: "Can I track the progress of my new website project?",
    answer:
      "Yes, you'll get a dedicated project manager and regular updates throughout development.",
  },
  {
    question: "Which e-commerce technology platforms do you work with?",
    answer: "We work with Shopify, WooCommerce, Magento, and custom-coded solutions.",
  },
  {
    question: "How do I find a professional web design company in Toronto?",
    answer:
      "Look for a proven track record, transparent pricing, and real client results, all core to how we work.",
  },
  {
    question: "Can you handle a complex migration without disrupting our business?",
    answer:
      "Yes, we plan and test carefully, scheduling deployment during low-traffic windows to keep your business running smoothly.",
  },
];

export default function FAQ({ faqs }: { faqs?: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [cmsFaqs, setCmsFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [eyebrow, setEyebrow] = useState("FAQ");
  const [heading, setHeading] = useState("Frequently asked questions");
  const [intro, setIntro] = useState(
    "Answers about how we work, timelines, and delivery. Still stuck? Chat with the team."
  );

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/cms/content?type=homepage").then((r) => (r.ok ? r.json() : null)),
      faqs?.length
        ? Promise.resolve(null)
        : fetch("/api/cms/content?type=faqs&page=home").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([homeData, faqData]) => {
        if (cancelled) return;
        const hp = homeData?.homepage as Record<string, unknown> | undefined;
        if (hp?.faqEyebrow) setEyebrow(String(hp.faqEyebrow));
        if (hp?.faqHeading) setHeading(String(hp.faqHeading));
        if (hp?.faqIntro) setIntro(String(hp.faqIntro));
        const list = faqData?.faqs as { question?: string; answer?: string }[] | undefined;
        if (list?.length) {
          setCmsFaqs(
            list
              .filter((f) => f.question && f.answer)
              .map((f) => ({ question: String(f.question), answer: String(f.answer) }))
          );
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [faqs]);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const displayFaqs = faqs && faqs.length > 0 ? faqs : cmsFaqs.length ? cmsFaqs : HOME_FAQS;

  if (!displayFaqs || displayFaqs.length === 0) return null;

  const mid = Math.ceil(displayFaqs.length / 2);
  const columns = [
    displayFaqs.slice(0, mid).map((faq, i) => ({ faq, index: i })),
    displayFaqs.slice(mid).map((faq, i) => ({ faq, index: i + mid })),
  ];

  const renderItem = (faq: { question: string; answer: string }, index: number) => {
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
  };

  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="max-w-[1600px] mx-auto px-5 sm:px-6 md:px-10 lg:px-14">
        <div className="text-center mb-12 md:mb-14">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#0055FF] mb-3">
            {eyebrow}
          </p>
          <h2 className="text-[28px] sm:text-4xl font-semibold tracking-tight text-[#0f172a] mb-3">
            {heading}
          </h2>
          <p className="text-slate-500 text-[15px] sm:text-base max-w-xl mx-auto leading-relaxed">
            {intro}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 lg:gap-x-24">
          {columns.map((col, colIndex) => (
            <div key={colIndex} className="border-t border-slate-200">
              {col.map(({ faq, index }) => renderItem(faq, index))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
