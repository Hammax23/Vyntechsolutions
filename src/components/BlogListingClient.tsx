"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BLOG_PLACEHOLDER, blogImageUnoptimized } from "@/lib/blog-image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { type BlogListingChrome, type BlogPost } from "@/data/blogData";
import { cmsInlineToHtml } from "@/lib/richtext";
import { DEFAULT_NAV_CHROME } from "@/lib/ui-copy";

const ARROW = "M14 5l7 7m0 0l-7 7m7-7H3";

function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function Avatar({ name }: { name: string }) {
  const initials = (name || "V").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0055FF] to-[#00E1FF] text-[10px] font-bold text-white">
      {initials}
    </span>
  );
}

function Meta({ post, light }: { post: BlogPost; light?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 text-xs ${light ? "text-white/70" : "text-gray-500"}`}>
      <Avatar name={post.author} />
      <span className={`font-medium ${light ? "text-white" : "text-[#1a1a2e]"}`}>{post.author}</span>
      {post.readTime ? (
        <>
          <span aria-hidden className="opacity-50">•</span>
          <span className="inline-flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <circle cx="12" cy="12" r="9" strokeWidth={2} />
              <path strokeLinecap="round" strokeWidth={2} d="M12 7v5l3 2" />
            </svg>
            {post.readTime}
          </span>
        </>
      ) : null}
    </div>
  );
}

function Description({ post, className }: { post: BlogPost; className: string }) {
  const html = cmsInlineToHtml(post.excerpt || post.metaDescription);
  if (!html) return null;
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function BlogListingClient({
  initialPosts,
  initialCategories,
  initialChrome,
  initialNavChrome,
}: {
  initialPosts: BlogPost[];
  initialCategories: string[];
  initialChrome: BlogListingChrome;
  initialNavChrome?: typeof DEFAULT_NAV_CHROME;
}) {
  const posts = initialPosts;
  const categories = initialCategories;
  const chrome = initialChrome;
  const navChrome = initialNavChrome || DEFAULT_NAV_CHROME;
  const allLabel = chrome.allCategoryLabel || categories[0] || "All";

  const [selectedCategory, setSelectedCategory] = useState(allLabel);
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    posts.forEach((p) => m.set(p.category, (m.get(p.category) || 0) + 1));
    return m;
  }, [posts]);

  const featuredPost = posts.find((p) => (p as { featured?: boolean }).featured) || posts[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (selectedCategory !== allLabel && p.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        stripHtml(p.excerpt || p.metaDescription || "").toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [posts, selectedCategory, allLabel, query]);

  const browsing = selectedCategory !== allLabel || query.trim() !== "";
  const showFeatured = !browsing && featuredPost;
  const gridPosts = showFeatured ? filtered.filter((p) => p.slug !== featuredPost.slug) : filtered;

  if (!featuredPost) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center bg-white">
          <p className="text-gray-500">{chrome.emptyPostsMessage}</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#0f1020] pb-14 pt-28 sm:pb-20 sm:pt-32">
          <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#0055FF]/30 blur-[110px]" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[#00E1FF]/20 blur-[110px]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "26px 26px" }}
          />
          <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6">
            <div className="mb-8 flex items-center gap-2 text-sm text-white/50">
              <Link href="/" className="transition-colors hover:text-white">{navChrome.homeLabel}</Link>
              <span>›</span>
              <span className="text-white">{chrome.breadcrumbLabel}</span>
            </div>

            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[#00E1FF]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00E1FF]" />
                  {posts.length} {posts.length === 1 ? "article" : "articles"}
                </span>
                <h1 className="mb-4 text-4xl font-bold leading-[1.1] text-white sm:text-5xl md:text-6xl">
                  {chrome.heroHeading}
                </h1>
                <div
                  className="max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg [&_a]:text-[#00E1FF] [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: cmsInlineToHtml(chrome.heroBody) }}
                />
              </div>

              <label className="relative block w-full lg:w-96">
                <span className="sr-only">Search articles</span>
                <svg className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <circle cx="11" cy="11" r="7" strokeWidth={2} />
                  <path strokeLinecap="round" strokeWidth={2} d="m20 20-3.5-3.5" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search articles…"
                  className="w-full rounded-xl border border-white/15 bg-white/10 py-3.5 pl-12 pr-4 text-white placeholder:text-white/40 outline-none backdrop-blur transition focus:border-[#00E1FF] focus:bg-white/15"
                />
              </label>
            </div>
          </div>
        </section>

        {/* Category filter */}
        <section className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
            <div className="-mx-1 flex gap-2 overflow-x-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((category) => {
                const active = selectedCategory === category;
                const count = category === allLabel ? posts.length : counts.get(category) || 0;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    aria-pressed={active}
                    className={`mx-1 inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                      active
                        ? "bg-[#1a1a2e] text-white shadow-lg shadow-[#1a1a2e]/20"
                        : "bg-gray-100 text-gray-600 hover:bg-[#0055FF]/10 hover:text-[#0055FF]"
                    }`}
                  >
                    {category}
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-white/20" : "bg-white text-gray-500"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured */}
        {showFeatured && (
          <section className="bg-[#f6f8fc] pt-10 sm:pt-14">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="group relative block overflow-hidden rounded-3xl bg-[#0f1020] shadow-xl shadow-[#0f1020]/10"
              >
                <div className="grid lg:grid-cols-[1.15fr_1fr]">
                  <div className="relative min-h-[260px] overflow-hidden sm:min-h-[340px] lg:min-h-[420px]">
                    <Image
                      src={featuredPost.image || BLOG_PLACEHOLDER}
                      unoptimized={blogImageUnoptimized(featuredPost.image || BLOG_PLACEHOLDER)}
                      alt={featuredPost.title}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 700px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1020]/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#0f1020]" />
                    <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#0055FF] to-[#00B4FF] px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg">
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                        <path d="M10 1.5l2.6 5.3 5.9.9-4.25 4.1 1 5.8L10 14.8l-5.25 2.8 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
                      </svg>
                      {chrome.featuredLabel}
                    </span>
                  </div>
                  <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
                    <span className="mb-4 w-fit rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-[#00E1FF]">
                      {featuredPost.category}
                    </span>
                    <h2 className="mb-4 text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                      {featuredPost.title}
                    </h2>
                    <Description post={featuredPost} className="mb-6 line-clamp-4 text-base leading-relaxed text-white/70 [&_a]:text-[#00E1FF]" />
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
                      <Meta post={featuredPost} light />
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                        Read article
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-[#0055FF]">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ARROW} />
                          </svg>
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Grid */}
        <section className={`pb-16 pt-10 sm:pb-20 sm:pt-12 ${showFeatured ? "bg-[#f6f8fc]" : "bg-white"}`}>
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
            {browsing && (
              <p className="mb-6 text-sm text-gray-500">
                {filtered.length} {filtered.length === 1 ? "result" : "results"}
                {selectedCategory !== allLabel ? <> in <strong className="text-[#1a1a2e]">{selectedCategory}</strong></> : null}
                {query.trim() ? <> for “<strong className="text-[#1a1a2e]">{query.trim()}</strong>”</> : null}
              </p>
            )}

            {gridPosts.length > 0 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {gridPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-[#0055FF]/20 hover:shadow-2xl hover:shadow-[#0055FF]/10"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                      <Image
                        src={post.image || BLOG_PLACEHOLDER}
                        unoptimized={blogImageUnoptimized(post.image || BLOG_PLACEHOLDER)}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#1a1a2e] shadow-sm backdrop-blur">
                        {post.category}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-[#1a1a2e] transition-colors group-hover:text-[#0055FF]">
                        {post.title}
                      </h3>
                      <Description post={post} className="mb-5 line-clamp-3 text-sm leading-relaxed text-gray-600 [&_a]:text-[#0055FF]" />
                      <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                        <Meta post={post} />
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#0055FF]/10 text-[#0055FF] transition-all duration-300 group-hover:translate-x-1 group-hover:bg-[#0055FF] group-hover:text-white">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ARROW} />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {filtered.length === 0 && (
              <div className="mx-auto max-w-md rounded-2xl border border-dashed border-gray-200 bg-white py-14 text-center">
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#0055FF]/10 text-[#0055FF]">
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <circle cx="11" cy="11" r="7" strokeWidth={2} />
                    <path strokeLinecap="round" strokeWidth={2} d="m20 20-3.5-3.5" />
                  </svg>
                </div>
                <h3 className="mb-1 text-lg font-semibold text-[#1a1a2e]">{chrome.emptyCategoryHeading}</h3>
                <p className="mb-5 text-sm text-gray-500">{chrome.emptyCategoryBody}</p>
                <button
                  onClick={() => {
                    setQuery("");
                    setSelectedCategory(allLabel);
                  }}
                  className="rounded-lg bg-[#1a1a2e] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#0055FF]"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white px-4 pb-16 sm:px-6 sm:pb-20">
          <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-3xl bg-[#0f1020] p-8 sm:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#0055FF]/40 blur-[90px]" />
            <div className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-[#00E1FF]/20 blur-[90px]" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <h2 className="mb-2 text-2xl font-bold text-white sm:text-3xl">{chrome.ctaHeading}</h2>
                <div className="text-white/70 [&_a]:text-[#00E1FF] [&_a]:underline" dangerouslySetInnerHTML={{ __html: cmsInlineToHtml(chrome.ctaBody) }} />
              </div>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("openLetsTalkBusiness"))}
                className="group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-[#0055FF] to-[#00B4FF] px-7 py-3.5 font-semibold text-white shadow-lg shadow-[#0055FF]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#0055FF]/40"
              >
                {chrome.ctaLabel}
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ARROW} />
                </svg>
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
