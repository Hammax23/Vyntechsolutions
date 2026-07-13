"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface JobPosition {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salary: string | null;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  isActive: boolean;
  createdAt: string;
}

export default function CareersPage() {
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState<JobPosition | null>(null);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      // Prefer Strapi CMS job openings when available
      const cmsRes = await fetch("/api/cms/content?type=jobs");
      if (cmsRes.ok) {
        const cms = await cmsRes.json();
        if (cms.jobs?.length) {
          setPositions(
            cms.jobs.map((j: Record<string, unknown>, idx: number) => ({
              id: String(j.documentId || j.id || idx),
              title: String(j.title || ""),
              department: String(j.department || ""),
              location: String(j.location || ""),
              type: String(j.type || "Full-time"),
              experience: String(j.experience || ""),
              salary: (j.salary as string) || null,
              description: String(j.description || ""),
              requirements: Array.isArray(j.requirements) ? j.requirements : [],
              responsibilities: Array.isArray(j.responsibilities) ? j.responsibilities : [],
              benefits: Array.isArray(j.benefits) ? j.benefits : [],
              isActive: j.isActive !== false,
              createdAt: String(j.createdAt || new Date().toISOString()),
            }))
          );
          setLoading(false);
          return;
        }
      }

      const response = await fetch("/api/careers");
      if (response.ok) {
        const data = await response.json();
        setPositions(data.positions || []);
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-[#1a1a2e] pt-28 pb-16 overflow-hidden">
          <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/50 text-sm mb-8">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <span className="text-white">Careers</span>
            </div>

            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Join Our Team
              </h1>
              <p className="text-white/70 leading-relaxed">
                We&apos;re looking for people who want to build great software and grow with us. If that sounds like you, let&apos;s talk.
              </p>
            </div>
          </div>
        </section>

        {/* Open Positions Section */}
        <section className="py-16 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="mb-10">
              <span className="inline-block bg-[#262b3f]/10 text-[#262b3f] text-sm font-semibold px-4 py-2 rounded-full mb-4">Open Positions</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">Current Openings</h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#0055FF]/20 border-t-[#0055FF] rounded-full animate-spin"></div>
              </div>
            ) : positions.length === 0 ? (
              /* No Positions Message */
              <div className="max-w-2xl">
                <div className="bg-[#f8f9fa] rounded-xl p-8">
                  <h3 className="text-xl font-semibold text-[#1a1a2e] mb-3">
                    No open positions right now
                  </h3>
                  <p className="text-gray-600 mb-6">
                    We don&apos;t have any roles open at the moment, but we&apos;re always interested in meeting talented people. Drop us your resume and we&apos;ll reach out when something comes up.
                  </p>
                  <a
                    href="mailto:careers@vyntechsolutions.ca"
                    className="inline-flex items-center gap-2 bg-[#262b3f] hover:bg-[#0055FF] text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-300"
                  >
                    Send Resume
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </div>
            ) : (
              /* Positions List */
              <div className="grid gap-4 max-w-4xl">
                {positions.map((position) => (
                  <div
                    key={position.id}
                    onClick={() => setSelectedPosition(position)}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#0055FF]/30 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[#1a1a2e] group-hover:text-[#0055FF] transition-colors">
                          {position.title}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">{position.department}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {position.location}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {position.type}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {position.experience}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#0055FF] text-sm font-medium group-hover:translate-x-1 transition-transform">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Why Work With Us */}
        <section className="py-16 bg-[#f8f9fa]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="mb-10">
              <span className="inline-block bg-[#262b3f]/10 text-[#262b3f] text-sm font-semibold px-4 py-2 rounded-full mb-4">Why Us</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">What you get</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-xl p-6 border border-transparent hover:border-[#262b3f]/20 transition-all">
                <h3 className="text-lg font-semibold text-[#1a1a2e] mb-2">Real projects</h3>
                <p className="text-gray-600 text-sm">Work on actual client projects, not internal tools nobody uses.</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-transparent hover:border-[#262b3f]/20 transition-all">
                <h3 className="text-lg font-semibold text-[#1a1a2e] mb-2">Remote-friendly</h3>
                <p className="text-gray-600 text-sm">Work from home or our office. We care about output, not hours at a desk.</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-transparent hover:border-[#262b3f]/20 transition-all">
                <h3 className="text-lg font-semibold text-[#1a1a2e] mb-2">No micromanaging</h3>
                <p className="text-gray-600 text-sm">We hire adults and treat them like adults. You own your work.</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-transparent hover:border-[#262b3f]/20 transition-all">
                <h3 className="text-lg font-semibold text-[#1a1a2e] mb-2">Growth</h3>
                <p className="text-gray-600 text-sm">Learn new tech, take on bigger projects, and grow your skills.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-10 bg-[#1a1a2e]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gradient-to-r from-[#262b3f]/20 to-transparent rounded-2xl p-6 md:p-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Interested?
                </h2>
                <p className="text-white/70 text-sm">
                  Send us your resume. We&apos;ll get back to you if there&apos;s a fit.
                </p>
              </div>
              <a
                href="mailto:careers@vyntechsolutions.ca"
                className="inline-flex items-center justify-center gap-2 bg-[#262b3f] hover:bg-[#0055FF] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 whitespace-nowrap"
              >
                Get in Touch
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Position Detail Modal */}
      {selectedPosition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPosition(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#1a1a2e]">{selectedPosition.title}</h2>
                  <p className="text-gray-500 mt-1">{selectedPosition.department}</p>
                </div>
                <button onClick={() => setSelectedPosition(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                  <strong>Location:</strong> {selectedPosition.location}
                </span>
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                  <strong>Type:</strong> {selectedPosition.type}
                </span>
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                  <strong>Experience:</strong> {selectedPosition.experience}
                </span>
                {selectedPosition.salary && (
                  <span className="text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                    <strong>Salary:</strong> {selectedPosition.salary}
                  </span>
                )}
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-[#1a1a2e] uppercase tracking-wider mb-3">About the Role</h3>
                <p className="text-gray-600 leading-relaxed">{selectedPosition.description}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <a
                href={`mailto:careers@vyntechsolutions.ca?subject=Application for ${selectedPosition.title}`}
                className="w-full flex items-center justify-center gap-2 bg-[#0055FF] hover:bg-[#0044CC] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
              >
                Apply Now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
