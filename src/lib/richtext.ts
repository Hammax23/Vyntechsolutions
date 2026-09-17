/**
 * Small utilities for turning free-form CMS text (from Strapi or local fallbacks)
 * into paragraph arrays / safe HTML we can render.
 *
 * Handles:
 *  - Real Unicode newlines (Strapi long-text editor)
 *  - Literal `\n` / `\n\n` (2-char sequences pasted from JSON)
 *  - Windows CRLF line endings
 *  - Strapi richtext HTML (h1–h6, lists, links)
 *  - Markdown-style content (# ## ###, lists, **bold**)
 */

/** Normalize any escaped newlines to real `\n`. Safe to call on already-clean text. */
export function normalizeNewlines(input: string | null | undefined): string {
  if (!input) return "";
  return String(input)
    .replace(/\\r\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

/**
 * Split CMS long text into paragraphs. Splits on any run of 2+ newlines so a
 * single line break inside a paragraph doesn't create a new one.
 */
export function toParagraphs(input: string | null | undefined): string[] {
  const normalized = normalizeNewlines(input);
  if (!normalized) return [];
  return normalized
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Split on single newlines (for line-broken labels like "Result Driven\nApproach"). */
export function toLines(input: string | null | undefined): string[] {
  const normalized = normalizeNewlines(input);
  if (!normalized) return [];
  return normalized.split(/\n/).map((line) => line.trim()).filter(Boolean);
}

/** True when CMS value already contains HTML tags (Strapi richtext / CKEditor). */
export function looksLikeHtml(input: string | null | undefined): boolean {
  if (!input) return false;
  return /<[a-z][\s\S]*>/i.test(String(input));
}

/**
 * Minimal sanitizer for trusted CMS HTML (admin-authored).
 * Strips scripts / inline handlers / javascript: URLs; keeps links and basic formatting.
 */
export function sanitizeCmsHtml(input: string | null | undefined): string {
  if (!input) return "";
  return String(input)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Inline markdown: **bold**, *italic*, [label](url) */
function inlineMarkdownToHtml(text: string): string {
  let out = escapeHtml(text);
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g,
    '<a href="$2" rel="noopener noreferrer">$1</a>'
  );
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>");
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  return out;
}

/**
 * Convert Markdown-ish CMS blog body to safe HTML (h1–h6, lists, paragraphs).
 * If input already looks like HTML, sanitize and return as-is.
 */
export function cmsBodyToHtml(input: string | null | undefined): string {
  const raw = normalizeNewlines(input).trim();
  if (!raw) return "";
  if (looksLikeHtml(raw)) return sanitizeCmsHtml(raw);

  const lines = raw.split("\n");
  const html: string[] = [];
  let i = 0;

  const flushParagraph = (buf: string[]) => {
    const text = buf.join(" ").trim();
    if (text) html.push(`<p>${inlineMarkdownToHtml(text)}</p>`);
    buf.length = 0;
  };

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(trimmed);
    if (heading) {
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdownToHtml(heading[2].trim())}</h${level}>`);
      i += 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(
          `<li>${inlineMarkdownToHtml(lines[i].trim().replace(/^[-*]\s+/, ""))}</li>`
        );
        i += 1;
      }
      html.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(
          `<li>${inlineMarkdownToHtml(lines[i].trim().replace(/^\d+\.\s+/, ""))}</li>`
        );
        i += 1;
      }
      html.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        quote.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      html.push(`<blockquote><p>${inlineMarkdownToHtml(quote.join(" "))}</p></blockquote>`);
      continue;
    }

    if (/^\*\*.+\*\*$/.test(trimmed)) {
      html.push(
        `<p><strong>${inlineMarkdownToHtml(trimmed.replace(/^\*\*|\*\*$/g, ""))}</strong></p>`
      );
      i += 1;
      continue;
    }

    const para: string[] = [];
    while (i < lines.length) {
      const t = lines[i].trim();
      if (
        !t ||
        /^(#{1,6})\s+/.test(t) ||
        /^[-*]\s+/.test(t) ||
        /^\d+\.\s+/.test(t) ||
        /^>\s?/.test(t)
      ) {
        break;
      }
      para.push(t);
      i += 1;
    }
    flushParagraph(para);
  }

  return html.join("\n");
}
