"use client";

import { cmsBodyToHtml } from "@/lib/richtext";

/** Renders Strapi richtext / Markdown (incl. [text](url) links) for legal & long body pages. */
export default function CmsHtml({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  if (!html) return null;

  const content = cmsBodyToHtml(html);
  if (!content) return null;

  return (
    <div
      className={
        `cms-html prose prose-invert max-w-none ` +
        `[&_a]:text-[#00E1FF] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-80 ` +
        className
      }
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
