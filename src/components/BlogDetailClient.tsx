"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CmsRichText from "@/components/CmsRichText";
import {
  type BlogDetailChrome,
  type BlogPost,
} from "@/data/blogData";
import { DEFAULT_NAV_CHROME } from "@/lib/ui-copy";

export default function BlogDetailClient({
  initialPost,
  initialRelated,
  initialChrome,
  initialNavChrome,
}: {
  initialPost: BlogPost | null;
  initialRelated: BlogPost[];
  initialChrome: BlogDetailChrome;
  initialNavChrome?: typeof DEFAULT_NAV_CHROME;
}) {
  const post = initialPost;
  const relatedPosts = initialRelated;
  const chrome = initialChrome;
  const navChrome = initialNavChrome || DEFAULT_NAV_CHROME;

  if (!post) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#1a1a2e] mb-4">
              {chrome.notFoundHeading}
            </h1>
            <Link href="/blog" className="text-[#262b3f] hover:underline">
              {chrome.notFoundLink}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <section className="relative bg-[#1a1a2e] pt-28 pb-16 overflow-hidden">
          <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 text-white/50 text-sm mb-8">
              <Link href="/" className="hover:text-white transition-colors">
                {navChrome.homeLabel}
              </Link>
              <span>›</span>
              <Link href="/blog" className="hover:text-white transition-colors">
                {chrome.breadcrumbLabel}
              </Link>
              <span>›</span>
              <span className="text-white">{post.category}</span>
            </div>

            <div className="max-w-3xl">
              <span className="px-3 py-1 bg-white/10 text-white text-sm rounded-full mb-4 inline-block">
                {post.category}
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                {post.title}
              </h1>
              <p className="text-white/70 mb-6">{post.excerpt}</p>
              <div className="flex flex-wrap items-center gap-3 text-white/60 text-sm">
                <span>{post.author}</span>
                {post.readTime ? (
                  <>
                    <span aria-hidden>·</span>
                    <span>{post.readTime}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="max-w-[800px] mx-auto px-4 sm:px-6">
            <article>
              <CmsRichText html={post.content} />
            </article>

            {(post.tags || []).length > 0 && (
              <div className="mt-10 pt-8 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-[#f8f9fa] text-[#262b3f] text-sm rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {relatedPosts.length > 0 && (
          <section className="py-12 bg-[#f8f9fa]">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
              <h2 className="text-xl font-bold text-[#1a1a2e] mb-6">
                {chrome.relatedHeading}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    href={`/blog/${relatedPost.slug}`}
                    className="bg-white rounded-xl p-5 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-[#262b3f]/20"
                  >
                    <span className="text-xs text-[#262b3f] font-medium">
                      {relatedPost.category}
                    </span>
                    <h3 className="text-lg font-semibold text-[#1a1a2e] mt-2 mb-2 line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-10 bg-[#1a1a2e]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gradient-to-r from-[#262b3f]/20 to-transparent rounded-2xl p-6 md:p-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {chrome.ctaHeading}
                </h2>
                <p className="text-white/70 text-sm">{chrome.ctaBody}</p>
              </div>
              <Link
                href="/lets-talk-business"
                className="inline-flex items-center justify-center gap-2 bg-[#262b3f] hover:bg-[#0055FF] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 whitespace-nowrap"
              >
                {chrome.ctaLabel}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
