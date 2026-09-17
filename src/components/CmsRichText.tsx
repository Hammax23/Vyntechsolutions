"use client";

import { cmsBodyToHtml } from "@/lib/richtext";

type Props = {
  html?: string | null;
  className?: string;
  /** When plain text with no markdown structure, wrap each paragraph in <p>. Default true. */
  asParagraphs?: boolean;
};

const ARTICLE_PROSE =
  "cms-richtext [&_a]:text-[#0055FF] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-80 " +
  "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-[#1a1a2e] [&_h1]:mt-10 [&_h1]:mb-4 " +
  "[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#1a1a2e] [&_h2]:mt-10 [&_h2]:mb-4 " +
  "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[#1a1a2e] [&_h3]:mt-8 [&_h3]:mb-3 " +
  "[&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-[#1a1a2e] [&_h4]:mt-6 [&_h4]:mb-2 " +
  "[&_h5]:text-base [&_h5]:font-semibold [&_h5]:text-[#1a1a2e] [&_h5]:mt-4 [&_h5]:mb-2 " +
  "[&_h6]:text-sm [&_h6]:font-semibold [&_h6]:text-[#1a1a2e] [&_h6]:mt-4 [&_h6]:mb-2 " +
  "[&_p]:text-gray-600 [&_p]:leading-relaxed [&_p]:mb-4 " +
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:text-gray-600 " +
  "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:text-gray-600 " +
  "[&_li]:mb-2 " +
  "[&_blockquote]:border-l-4 [&_blockquote]:border-[#262b3f]/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-4 " +
  "[&_strong]:text-[#1a1a2e] [&_code]:bg-[#f8f9fa] [&_code]:px-1 [&_code]:rounded";

/**
 * Renders Strapi richtext — HTML (h1–h6, lists, links) or Markdown (# ## ###).
 * SEO editors can format freely in Admin; both styles render on the site.
 */
export default function CmsRichText({ html, className = "", asParagraphs = true }: Props) {
  const raw = (html || "").trim();
  if (!raw) return null;

  const converted = cmsBodyToHtml(raw);
  if (!converted) return null;

  // Plain single paragraph without block tags → optional simple <p>
  if (
    asParagraphs === false &&
    !/<(h[1-6]|ul|ol|blockquote|p)\b/i.test(converted)
  ) {
    return <p className={className}>{raw}</p>;
  }

  return (
    <div
      className={`${ARTICLE_PROSE} ${className}`}
      dangerouslySetInnerHTML={{ __html: converted }}
    />
  );
}
