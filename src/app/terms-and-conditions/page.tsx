'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsAndConditionsPage() {
  const lastUpdated = "March 27, 2026";

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00B4FF]/5 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Terms & <span className="text-[#00B4FF]">Conditions</span>
            </h1>
            <p className="text-white/60">Last Updated: {lastUpdated}</p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Introduction */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-white/70 leading-relaxed">
                By using <span className="text-[#00B4FF]">vyntechsolutions.ca</span> or hiring VynTech Solutions for any project, you agree to these terms. These terms are governed by the laws of <strong className="text-white">Ontario, Canada</strong>.
              </p>
            </div>

            {/* Our Services */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Our Services</h2>
              <p className="text-white/70 mb-3">We provide:</p>
              <ul className="list-disc pl-5 text-white/70 space-y-1">
                <li>Website design & development</li>
                <li>Web & mobile app development</li>
                <li>UI/UX design</li>
                <li>SEO & digital marketing</li>
                <li>Maintenance & support</li>
              </ul>
              <p className="text-white/70 mt-3">Each project starts with a proposal or agreement that defines scope, timeline, and pricing.</p>
            </div>

            {/* Payment Terms */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Payment</h2>
              <ul className="list-disc pl-5 text-white/70 space-y-2">
                <li><strong className="text-white">50% upfront</strong> deposit required to start work</li>
                <li><strong className="text-white">50% on completion</strong> before final delivery</li>
                <li>Prices are in <strong className="text-white">CAD</strong> + applicable taxes (HST/GST)</li>
                <li>Payment via bank transfer or Stripe</li>
                <li>Late payments may pause the project until cleared</li>
              </ul>
            </div>

            {/* Project Process */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Your Responsibilities</h2>
              <ul className="list-disc pl-5 text-white/70 space-y-2">
                <li>Provide content (text, images, logos) on time</li>
                <li>Give feedback within reasonable timeframes</li>
                <li>Ensure you have rights to materials you provide</li>
                <li>Share necessary logins/access for project work</li>
              </ul>
              <p className="text-white/70 mt-3 text-sm">Delays in providing materials may extend project timelines.</p>
            </div>

            {/* Ownership */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Ownership & IP</h2>
              <div className="space-y-3 text-white/70">
                <p><strong className="text-white">After full payment:</strong> You own the custom design and code we create for you.</p>
                <p><strong className="text-white">We retain:</strong> Rights to use third-party tools, libraries, and frameworks. We may also showcase the project in our portfolio.</p>
                <p><strong className="text-white">Your materials:</strong> You keep ownership of your logos, content, and brand assets.</p>
              </div>
            </div>

            {/* Warranty & Support */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Warranty</h2>
              <p className="text-white/70">
                We offer <strong className="text-white">30 days free bug fixes</strong> after project delivery. This covers bugs in our code only - not issues from your changes, third-party plugins, or hosting problems.
              </p>
            </div>

            {/* Cancellation */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Cancellation</h2>
              <ul className="list-disc pl-5 text-white/70 space-y-2">
                <li>You may cancel anytime with written notice</li>
                <li>You pay for work completed up to cancellation date</li>
                <li>Deposits are non-refundable once work begins</li>
              </ul>
            </div>

            {/* Liability */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Limitation of Liability</h2>
              <p className="text-white/70">
                We&apos;re not responsible for indirect damages like lost profits or business interruption. Our maximum liability is limited to the amount you paid for the specific project.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-gradient-to-r from-[#00B4FF]/10 to-[#00FF94]/10 border border-[#00B4FF]/30 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Questions?</h2>
              <div className="text-white/70 space-y-1">
                <p><strong className="text-white">VynTech Solutions</strong></p>
                <p>Email: <span className="text-[#00B4FF]">info@vyntechsolutions.ca</span></p>
                <p>Phone: <span className="text-[#00B4FF]">+1 (437) 388-7721</span></p>
                <p>Location: Toronto, Ontario, Canada</p>
              </div>
            </div>

          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
