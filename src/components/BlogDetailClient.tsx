"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CmsRichText from "@/components/CmsRichText";
import { type BlogDetailChrome, type BlogPost } from "@/data/blogData";
import { DEFAULT_NAV_CHROME } from "@/lib/ui-copy";
import { cmsBodyToHtml, cmsInlineToHtml } from "@/lib/richtext";
import { BLOG_PLACEHOLDER, blogImageUnoptimized } from "@/lib/blog-image";

const ARROW = "M14 5l7 7m0 0l-7 7m7-7H3";

type TocItem = { id: string; text: string; level: number };

/** Add anchor ids to h2/h3 and collect them for the "On this page" list. */
function withToc(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const used = new Set<string>();
  const out = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_m, lvl, attrs, inner) => {
    const text = inner.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").trim();
    if (!text) return _m;
    let id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "section";
    let n = 2;
    while (used.has(id)) id = `${id.replace(/-\d+$/, "")}-${n++}`;
    used.add(id);
    toc.push({ id, text, level: Number(lvl) });
    return `<h${lvl}${attrs} id="${id}">${inner}</h${lvl}>`;
  });
  return { html: out, toc };
}

function Avatar({ name, size = "h-10 w-10 text-sm" }: { name: string; size?: string }) {
  const initials = (name || "V").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0055FF] to-[#00E1FF] font-bold text-white ${size}`}>
      {initials}
    </span>
  );
}

function ProgressBar() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.getElementById("blog-article");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      setP(Math.min(1, Math.max(0, (-rect.top + window.innerHeight * 0.2) / Math.max(total, 1))));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <div className="fixed left-0 top-0 z-[60] h-1 w-full bg-transparent" aria-hidden>
      <div className="h-full origin-left bg-gradient-to-r from-[#0055FF] to-[#00E1FF]" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}

function Share({ title, description, tags }: { title: string; description?: string; tags?: string[] }) {
  const [toast, setToast] = useState("");
  const [url, setUrl] = useState("");
  // Always share the clean post address (no #section from the contents list, no tracking query).
  useEffect(() => setUrl(`${window.location.origin}${window.location.pathname}`), []);
  const enc = encodeURIComponent;
  const hashtags = (tags || [])
    .map((t) => t.replace(/[^A-Za-z0-9]/g, ""))
    .filter(Boolean)
    .slice(0, 3);
  const plainDesc = (description || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 140);
  const btn =
    "grid h-10 w-10 place-items-center rounded-full border border-gray-200 bg-white text-gray-500 transition-all hover:-translate-y-0.5 hover:text-white";

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const copy = async (msg = "Link copied!") => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* ignore */
      }
      ta.remove();
    }
    flash(msg);
  };

  // Instagram has no web share link: use the phone's share sheet when available,
  // otherwise copy the link and open Instagram so it can be pasted in a story, bio or DM.
  const shareInstagram = async () => {
    if (typeof navigator.share === "function" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      try {
        await navigator.share({ title, text: plainDesc || title, url });
        return;
      } catch {
        /* cancelled — fall through */
      }
    }
    await copy("Link copied — paste it in your Instagram story, bio or DM");
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2">
        <a
          className={`${btn} hover:border-[#1877F2] hover:bg-[#1877F2]`}
          aria-label="Share on Facebook"
          title="Share on Facebook"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}${hashtags[0] ? `&hashtag=${enc("#" + hashtags[0])}` : ""}`}
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0022 12z" /></svg>
        </a>
        <button
          type="button"
          className={`${btn} hover:border-transparent hover:bg-gradient-to-tr hover:from-[#feda75] hover:via-[#d62976] hover:to-[#4f5bd5]`}
          aria-label="Share on Instagram"
          title="Share on Instagram"
          onClick={shareInstagram}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
        </button>
        <a
          className={`${btn} hover:border-[#0A66C2] hover:bg-[#0A66C2]`}
          aria-label="Share on LinkedIn"
          title="Share on LinkedIn"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`}
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4a2.1 2.1 0 110-4.2 2.1 2.1 0 010 4.2zM7.1 20.5H3.6V9h3.5v11.5z" /></svg>
        </a>
        <a
          className={`${btn} hover:border-black hover:bg-black`}
          aria-label="Share on X"
          title="Share on X"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}${hashtags.length ? `&hashtags=${enc(hashtags.join(","))}` : ""}`}
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.2 2.3h3.3l-7.2 8.3 8.5 11.2h-6.7l-5.2-6.8-6 6.8H1.6l7.7-8.8L1.2 2.3H8l4.7 6.2 5.5-6.2zm-1.2 17.5h1.8L7 4.2H5.1l11.9 15.6z" /></svg>
        </a>
        <a
          className={`${btn} hover:border-[#25D366] hover:bg-[#25D366]`}
          aria-label="Share on WhatsApp"
          title="Share on WhatsApp"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://wa.me/?text=${enc(`${title}\n${url}`)}`}
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
        </a>
        <a
          className={`${btn} hover:border-[#1a1a2e] hover:bg-[#1a1a2e]`}
          aria-label="Share by email"
          title="Share by email"
          href={`mailto:?subject=${enc(title)}&body=${enc(`${plainDesc ? plainDesc + "\n\n" : ""}Read it here: ${url}`)}`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="m3 7 9 6 9-6" /></svg>
        </a>
        <button
          type="button"
          className={`${btn} hover:border-[#0055FF] hover:bg-[#0055FF]`}
          aria-label="Copy link"
          title="Copy link"
          onClick={() => copy()}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3A4 4 0 0011 18.7l1-1" /></svg>
        </button>
      </div>
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none mt-2 text-xs font-medium text-[#0055FF] transition-opacity duration-300 ${toast ? "opacity-100" : "opacity-0"}`}
      >
        {toast || "\u00A0"}
      </div>
    </div>
  );
}

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

  const { html, toc } = useMemo(
    () => withToc(cmsBodyToHtml(post?.content)),
    [post?.content]
  );
  const [active, setActive] = useState("");
  const [tocOpen, setTocOpen] = useState(false);

  const tocListRef = useRef<HTMLUListElement>(null);
  const clickLock = useRef(0);

  // Scroll-spy: the active item is the last heading that has passed the top of the screen.
  useEffect(() => {
    if (!toc.length) return;
    const OFFSET = 130;
    const update = () => {
      if (Date.now() < clickLock.current) return;
      let current = "";
      for (const t of toc) {
        const el = document.getElementById(t.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - OFFSET <= 0) current = t.id;
        else break;
      }
      const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (nearBottom && toc.length) current = toc[toc.length - 1].id;
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [toc]);

  // Keep the active item visible inside the (scrollable) contents list.
  useEffect(() => {
    const list = tocListRef.current;
    if (!list || !active) return;
    const item = list.querySelector<HTMLElement>(`[data-toc="${active}"]`);
    if (!item) return;
    const top = item.offsetTop - list.offsetTop;
    if (top < list.scrollTop + 8 || top + item.offsetHeight > list.scrollTop + list.clientHeight - 8) {
      list.scrollTo({ top: top - list.clientHeight / 2 + item.offsetHeight / 2, behavior: "smooth" });
    }
  }, [active]);

  const goTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    clickLock.current = Date.now() + 900;
    setActive(id);
    setTocOpen(false);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  if (!post) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center bg-white">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-[#1a1a2e]">{chrome.notFoundHeading}</h1>
            <Link href="/blog" className="text-[#0055FF] hover:underline">{chrome.notFoundLink}</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const description = cmsInlineToHtml(post.excerpt || post.metaDescription);
  const showToc = toc.length >= 3;

  return (
    <>
      <ProgressBar />
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
          <div className="relative z-10 mx-auto max-w-[1100px] px-4 sm:px-6">
            <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-white/50">
              <Link href="/" className="transition-colors hover:text-white">{navChrome.homeLabel}</Link>
              <span>›</span>
              <Link href="/blog" className="transition-colors hover:text-white">{chrome.breadcrumbLabel}</Link>
              <span>›</span>
              <span className="text-white">{post.category}</span>
            </div>

            <div className="max-w-3xl">
              <span className="mb-5 inline-flex rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-xs font-medium uppercase tracking-wider text-[#00E1FF]">
                {post.category}
              </span>
              <h1 className="mb-5 text-3xl font-bold leading-[1.15] text-white sm:text-4xl md:text-5xl">{post.title}</h1>
              {description && (
                <div
                  className="mb-8 text-lg leading-relaxed text-white/70 [&_a]:text-[#00E1FF] [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              )}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <Avatar name={post.author} />
                  <div className="leading-tight">
                    <div className="text-sm font-semibold text-white">{post.author}</div>
                    {post.readTime ? (
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-white/60">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <circle cx="12" cy="12" r="9" strokeWidth={2} />
                          <path strokeLinecap="round" strokeWidth={2} d="M12 7v5l3 2" />
                        </svg>
                        {post.readTime} read
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Article */}
        <section className="bg-white py-12 sm:py-16">
          <div className={`mx-auto px-4 sm:px-6 ${showToc ? "max-w-[1100px] lg:grid lg:grid-cols-[240px_1fr] lg:gap-14" : "max-w-[760px]"}`}>
            {showToc && (
              <aside className="mb-10 lg:mb-0">
                <div className="lg:sticky lg:top-28">
                  <div className="rounded-2xl border border-gray-100 bg-[#f6f8fc] p-5">
                    <button
                      type="button"
                      onClick={() => setTocOpen((v) => !v)}
                      aria-expanded={tocOpen}
                      className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500 lg:pointer-events-none lg:mb-3"
                    >
                      On this page
                      <svg className={`h-4 w-4 transition-transform lg:hidden ${tocOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <ul
                      ref={tocListRef}
                      className={`${tocOpen ? "mt-3 block" : "hidden"} relative max-h-[52vh] overflow-y-auto border-l border-gray-200 pr-1 [scrollbar-width:thin] lg:block`}
                    >
                      {toc.map((t, i) => {
                        const isActive = active === t.id;
                        const passed = active !== "" && toc.findIndex((x) => x.id === active) > i;
                        return (
                          <li key={t.id} data-toc={t.id}>
                            <a
                              href={`#${t.id}`}
                              onClick={goTo(t.id)}
                              aria-current={isActive ? "location" : undefined}
                              className={`-ml-px block border-l-2 py-1.5 pr-2 leading-snug transition-all duration-200 ${
                                t.level === 3 ? "pl-6 text-[13px]" : "pl-4 text-sm"
                              } ${
                                isActive
                                  ? "border-[#0055FF] bg-[#0055FF]/10 font-semibold text-[#0055FF]"
                                  : passed
                                  ? "border-transparent text-gray-700 hover:border-gray-300 hover:text-[#1a1a2e]"
                                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-[#1a1a2e]"
                              }`}
                            >
                              {t.text}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div className="mt-5 hidden lg:block">
                    <div className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Share</div>
                    <Share title={post.title} description={post.excerpt || post.metaDescription} tags={post.tags} />
                  </div>
                </div>
              </aside>
            )}

            <div className="min-w-0 max-w-[760px]">
              <article id="blog-article" className="blog-article">
                <CmsRichText html={html} className="blog-article-body" />
              </article>

              {(post.tags || []).length > 0 && (
                <div className="mt-12 flex flex-wrap gap-2 border-t border-gray-100 pt-8">
                  {post.tags.map((tag, i) => (
                    <span key={i} className="rounded-full bg-[#0055FF]/10 px-3.5 py-1.5 text-sm font-medium text-[#0055FF]">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-8 flex flex-col gap-5 rounded-2xl border border-gray-100 bg-[#f6f8fc] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-center gap-4">
                  <Avatar name={post.author} size="h-12 w-12 text-base" />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Written by</div>
                    <div className="font-bold text-[#1a1a2e]">{post.author}</div>
                  </div>
                </div>
                <div className={showToc ? "lg:hidden" : ""}>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Share this article</div>
                  <Share title={post.title} description={post.excerpt || post.metaDescription} tags={post.tags} />
                </div>
              </div>

              <Link href="/blog" className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#0055FF]">
                <svg className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ARROW} />
                </svg>
                Back to all articles
              </Link>
            </div>
          </div>
        </section>

        {/* Related */}
        {relatedPosts.length > 0 && (
          <section className="bg-[#f6f8fc] py-14 sm:py-16">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
              <h2 className="mb-8 text-2xl font-bold text-[#1a1a2e]">{chrome.relatedHeading}</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {relatedPosts.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/blog/${r.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-[#0055FF]/20 hover:shadow-2xl hover:shadow-[#0055FF]/10"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                      <Image
                        src={r.image || BLOG_PLACEHOLDER}
                        unoptimized={blogImageUnoptimized(r.image || BLOG_PLACEHOLDER)}
                        alt={r.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#1a1a2e] shadow-sm">
                        {r.category}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-[#1a1a2e] transition-colors group-hover:text-[#0055FF]">
                        {r.title}
                      </h3>
                      <div
                        className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600 [&_a]:text-[#0055FF]"
                        dangerouslySetInnerHTML={{ __html: cmsInlineToHtml(r.excerpt || r.metaDescription) }}
                      />
                      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[#0055FF]">
                        Read article
                        <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ARROW} />
                        </svg>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-white px-4 py-14 sm:px-6 sm:py-16">
          <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-3xl bg-[#0f1020] p-8 sm:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#0055FF]/40 blur-[90px]" />
            <div className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-[#00E1FF]/20 blur-[90px]" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <h2 className="mb-2 text-2xl font-bold text-white sm:text-3xl">{chrome.ctaHeading}</h2>
                <div className="text-white/70 [&_a]:text-[#00E1FF] [&_a]:underline" dangerouslySetInnerHTML={{ __html: cmsInlineToHtml(chrome.ctaBody) }} />
              </div>
              <Link
                href="/lets-talk-business"
                className="group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-[#0055FF] to-[#00B4FF] px-7 py-3.5 font-semibold text-white shadow-lg shadow-[#0055FF]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#0055FF]/40"
              >
                {chrome.ctaLabel}
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ARROW} />
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
