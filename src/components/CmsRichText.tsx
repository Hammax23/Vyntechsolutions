"use client";

import { looksLikeHtml, sanitizeCmsHtml, toParagraphs } from "@/lib/richtext";

type Props = {
  html?: string | null;
  className?: string;
  /** When plain text, wrap each paragraph in <p>. Default true. */
  asParagraphs?: boolean;
};

/**
 * Renders Strapi richtext (HTML with links) or plain long-text safely.
 * SEO editors can insert internal/external links in Admin richtext fields.
 */
export default function CmsRichText({ html, className = "", asParagraphs = true }: Props) {
  const raw = (html || "").trim();
  if (!raw) return null;

  if (looksLikeHtml(raw)) {
    return (
      <div
        className={`cms-richtext [&_a]:text-[#0055FF] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-80 [&_p]:mb-3 last:[&_p]:mb-0 ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(raw) }}
      />
    );
  }

  if (!asParagraphs) {
    return <p className={className}>{raw}</p>;
  }

  const paras = toParagraphs(raw);
  if (paras.length <= 1) {
    return <p className={className}>{paras[0] || raw}</p>;
  }

  return (
    <div className={className}>
      {paras.map((p, i) => (
        <p key={i} className={i < paras.length - 1 ? "mb-3" : undefined}>
          {p}
        </p>
      ))}
    </div>
  );
}
