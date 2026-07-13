'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CmsHtml from '@/components/CmsHtml';

function PrivacyFallback() {
  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <p className="text-white/70 leading-relaxed">
          VynTech Solutions (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) respects your privacy. This policy explains how we collect and use your information when you use <span className="text-[#00B4FF]">vyntechsolutions.ca</span> or our services. We comply with <strong className="text-white">PIPEDA</strong> (Personal Information Protection and Electronic Documents Act) and Canadian privacy laws.
        </p>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">What We Collect</h2>
        <div className="space-y-3 text-white/70">
          <p><strong className="text-white">Information you provide:</strong> Name, email, phone number, company name when you contact us or request a quote.</p>
          <p><strong className="text-white">Automatic data:</strong> IP address, browser type, pages visited, and cookies for website functionality and analytics.</p>
          <p><strong className="text-white">Payment info:</strong> Processed securely through Stripe - we never store your card details.</p>
        </div>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">How We Use Your Information</h2>
        <ul className="list-disc pl-5 text-white/70 space-y-2">
          <li>Respond to your inquiries and provide our services</li>
          <li>Send project updates, invoices, and important notices</li>
          <li>Improve our website and services</li>
          <li>Send marketing emails (only with your consent - you can unsubscribe anytime)</li>
        </ul>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Information Sharing</h2>
        <p className="text-white/70 mb-3"><strong className="text-white">We do not sell your data.</strong> We only share with:</p>
        <ul className="list-disc pl-5 text-white/70 space-y-2">
          <li><strong className="text-white">Service providers:</strong> Hosting, email, payments, analytics</li>
          <li><strong className="text-white">Legal requirements:</strong> When required by law or to protect our rights</li>
        </ul>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Your Rights</h2>
        <p className="text-white/70">Email us at <span className="text-[#00B4FF]">info@vyntechsolutions.ca</span> to access, correct, or delete your data.</p>
      </div>
      <div className="bg-gradient-to-r from-[#00B4FF]/10 to-[#00FF94]/10 border border-[#00B4FF]/30 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Contact Us</h2>
        <div className="text-white/70 space-y-1">
          <p><strong className="text-white">VynTech Solutions</strong></p>
          <p>Email: <span className="text-[#00B4FF]">info@vyntechsolutions.ca</span></p>
          <p>Location: Toronto, Ontario, Canada</p>
        </div>
      </div>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  const [title, setTitle] = useState('Privacy Policy');
  const [lastUpdated, setLastUpdated] = useState('March 27, 2026');
  const [body, setBody] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/cms/content?type=legal-page&slug=privacy-policy')
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {body ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-white/80">
                <CmsHtml html={body} />
              </div>
            ) : (
              <PrivacyFallback />
            )}
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
