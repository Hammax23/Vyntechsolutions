'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CmsHtml from '@/components/CmsHtml';

export default function PrivacyPolicyPage() {
  const [title, setTitle] = useState('Privacy Policy');
  const [lastUpdated, setLastUpdated] = useState('March 27, 2026');
  const [body, setBody] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/cms/content?type=legal-page&slug=privacy-policy')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const page = data?.page;
        if (!page) return;
        if (page.title) setTitle(String(page.title));
        if (page.lastUpdated) setLastUpdated(String(page.lastUpdated));
        if (page.body) {
          setBody(String(page.body));
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
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
            ) : loaded ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-white/70">
                Content unavailable. Please check back soon.
              </div>
            ) : null}
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
