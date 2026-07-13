'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CmsHtml from '@/components/CmsHtml';

function TermsFallback() {
  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <p className="text-white/70 leading-relaxed">
          By using vyntechsolutions.ca and our services, you agree to these Terms & Conditions. Please read them carefully.
        </p>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Our Services</h2>
        <p className="text-white/70">
          VynTech Solutions provides web development, mobile apps, cloud, AI/ML, SEO, and related digital services. Project scope, timelines, and fees are defined in individual agreements or quotes.
        </p>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Payments</h2>
        <p className="text-white/70">
          Invoices are due as stated in your agreement. Late payments may pause work. Refunds follow the terms of your signed contract.
        </p>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Intellectual Property</h2>
        <p className="text-white/70">
          Upon full payment, you own the deliverables created for your project, except third-party tools, libraries, and our pre-existing IP.
        </p>
      </div>
      <div className="bg-gradient-to-r from-[#00B4FF]/10 to-[#00FF94]/10 border border-[#00B4FF]/30 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Contact</h2>
        <p className="text-white/70">Questions? Email <span className="text-[#00B4FF]">info@vyntechsolutions.ca</span></p>
      </div>
    </div>
  );
}

export default function TermsAndConditionsPage() {
  const [title, setTitle] = useState('Terms & Conditions');
  const [lastUpdated, setLastUpdated] = useState('March 27, 2026');
  const [body, setBody] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/cms/content?type=legal-page&slug=terms-and-conditions')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const page = data?.page;
        if (!page) return;
        if (page.title) setTitle(String(page.title));
        if (page.lastUpdated) setLastUpdated(String(page.lastUpdated));
        if (page.body && !String(page.body).includes('See live')) {
          setBody(String(page.body));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00B4FF]/5 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
            <p className="text-white/60">Last Updated: {lastUpdated}</p>
          </motion.div>
        </div>
      </section>
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            {body ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-white/80">
                <CmsHtml html={body} />
              </div>
            ) : (
              <TermsFallback />
            )}
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
