"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPostBySlug, getRelatedPosts, BlogPost } from "@/data/blogData";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | undefined>(getPostBySlug(slug));
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>(getRelatedPosts(slug, 3));

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/cms/blog/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.post) return;
        setPost(data.post);
        if (data.related) setRelatedPosts(data.related);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!post) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#1a1a2e] mb-4">Article Not Found</h1>
            <Link href="/blog" className="text-[#262b3f] hover:underline">
              Back to Blog
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
        {/* Hero Section */}
        <section className="relative bg-[#1a1a2e] pt-28 pb-16 overflow-hidden">
          <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/50 text-sm mb-8">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
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
              <p className="text-white/70 mb-6">
                {post.excerpt}
              </p>
              <span className="text-white/60 text-sm">{post.author}</span>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-12 bg-white">
          <div className="max-w-[800px] mx-auto px-4 sm:px-6">
            <article className="prose prose-lg max-w-none prose-headings:text-[#1a1a2e] prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-4 prose-strong:text-[#1a1a2e] prose-ul:text-gray-600 prose-li:mb-2">
              {post.content.split('\n').map((paragraph, index) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return null;
                
                if (trimmed.startsWith('## ')) {
                  return <h2 key={index} className="text-2xl font-bold text-[#1a1a2e] mt-10 mb-4">{trimmed.replace('## ', '')}</h2>;
                }
                if (trimmed.startsWith('### ')) {
                  return <h3 key={index} className="text-xl font-semibold text-[#1a1a2e] mt-8 mb-3">{trimmed.replace('### ', '')}</h3>;
                }
                if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                  return <p key={index} className="font-semibold text-[#1a1a2e] mt-4 mb-2">{trimmed.replace(/\*\*/g, '')}</p>;
                }
                if (trimmed.startsWith('- ')) {
                  return <li key={index} className="text-gray-600 ml-4 mb-2">{trimmed.replace('- ', '')}</li>;
                }
                return <p key={index} className="text-gray-600 leading-relaxed mb-4">{trimmed}</p>;
              })}
            </article>

            {/* Tags */}
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
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-12 bg-[#f8f9fa]">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
              <h2 className="text-xl font-bold text-[#1a1a2e] mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    href={`/blog/${relatedPost.slug}`}
                    className="bg-white rounded-xl p-5 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-[#262b3f]/20"
                  >
                    <span className="text-xs text-[#262b3f] font-medium">{relatedPost.category}</span>
                    <h3 className="text-lg font-semibold text-[#1a1a2e] mt-2 mb-2 line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{relatedPost.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-10 bg-[#1a1a2e]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gradient-to-r from-[#262b3f]/20 to-transparent rounded-2xl p-6 md:p-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Need Help With Your Project?
                </h2>
                <p className="text-white/70 text-sm">
                  Let&apos;s discuss how we can help build your software solution.
                </p>
              </div>
              <Link
                href="/#get-in-touch"
                className="inline-flex items-center justify-center gap-2 bg-[#262b3f] hover:bg-[#0055FF] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 whitespace-nowrap"
              >
                Get in Touch
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
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
