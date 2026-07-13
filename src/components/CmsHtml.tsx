"use client";

/** Renders Strapi richtext / markdown-ish HTML safely enough for CMS body pages. */
export default function CmsHtml({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  if (!html) return null;

  // Convert basic markdown headings/paragraphs if content is plain markdown
  let content = html;
  if (!html.includes("<") && html.includes("\n")) {
    content = html
      .split(/\n\n+/)
      .map((block) => {
        const trimmed = block.trim();
        if (!trimmed) return "";
        if (trimmed.startsWith("### ")) return `<h3>${trimmed.slice(4)}</h3>`;
        if (trimmed.startsWith("## ")) return `<h2>${trimmed.slice(3)}</h2>`;
        if (trimmed.startsWith("# ")) return `<h1>${trimmed.slice(2)}</h1>`;
        if (trimmed.startsWith("- ")) {
          const items = trimmed
            .split("\n")
            .map((l) => l.replace(/^- /, "").trim())
            .filter(Boolean)
            .map((l) => `<li>${l}</li>`)
            .join("");
          return `<ul>${items}</ul>`;
        }
        return `<p>${trimmed.replace(/\n/g, "<br/>")}</p>`;
      })
      .join("");
  }

  return (
    <div
      className={`cms-html prose prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
