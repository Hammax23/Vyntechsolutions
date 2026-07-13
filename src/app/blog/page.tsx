"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { blogPosts, type BlogPost } from "@/data/blogData";

const defaultCategories = ["All", "Business", "Development", "Technology", "Design"];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [posts, setPosts] = useState<BlogPost[]>(blogPosts);
  const [categories, setCategories] = useState(defaultCategories);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cms/blog")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.posts?.length) return;
        setPosts(data.posts);
        const cats = Array.from(
          new Set<string>(["All", ...data.posts.map((p: BlogPost) => p.category).filter(Boolean)])
        );
        setCategories(cats);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPosts =
    selectedCategory === "All"
      ? posts
      : posts.filter((post) => post.category === selectedCategory);

  const featuredPost = posts[0];
  if (!featuredPost) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-500">No blog posts yet.</p>
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
              <span className="text-white">Blog</span>
            </div>

            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Blog
              </h1>
              <p className="text-white/70 leading-relaxed">
                Practical insights on software development, technology decisions, and building digital products.
              </p>
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-6 bg-white border-b border-gray-100">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-[#262b3f] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-[#262b3f]/10"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Post */}
        <section className="py-12 bg-[#f8f9fa]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <Link href={`/blog/${featuredPost.slug}`} className="group block">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                <div className="relative h-64 lg:h-auto min-h-[280px] overflow-hidden">
                  <Image 
                    src={featuredPost.image} 
                    alt={featuredPost.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 bg-[#262b3f] text-white text-xs font-medium rounded-full">
                      Featured
                    </span>
                  </div>
                </div>
                <div className="p-6 lg:p-8 flex flex-col justify-center">
                  <span className="text-sm text-[#262b3f] font-medium mb-3 block">{featuredPost.category}</span>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#1a1a2e] mb-3 group-hover:text-[#262b3f] transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {featuredPost.excerpt}
                  </p>
                  <span className="text-sm text-gray-500">{featuredPost.author}</span>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-12 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.slice(1).map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-[#262b3f]/20"
                >
                  <div className="relative h-44 overflow-hidden">
                    <Image 
                      src={post.image} 
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-white/90 text-[#262b3f] text-xs font-medium rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-[#1a1a2e] mb-2 group-hover:text-[#262b3f] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No articles in this category</h3>
                <p className="text-gray-400">Try selecting a different category</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-10 bg-[#1a1a2e]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gradient-to-r from-[#262b3f]/20 to-transparent rounded-2xl p-6 md:p-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Have a Project in Mind?
                </h2>
                <p className="text-white/70 text-sm">
                  Let&apos;s discuss how we can help build your software solution.
                </p>
              </div>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                className="inline-flex items-center justify-center gap-2 bg-[#262b3f] hover:bg-[#0055FF] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 whitespace-nowrap"
              >
                Get in Touch
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
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
