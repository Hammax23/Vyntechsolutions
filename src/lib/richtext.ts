/**
 * Small utilities for turning free-form CMS text (from Strapi or local fallbacks)
 * into paragraph arrays we can render safely.
 *
 * Handles all common cases we see in the wild:
 *  - Real Unicode newlines (Strapi long-text editor)
 *  - Literal `\n` / `\n\n` (2-char sequences pasted from JSON)
 *  - Windows CRLF line endings
 *  - Leading / trailing whitespace
 */

/** Normalize any escaped newlines to real `\n`. Safe to call on already-clean text. */
export function normalizeNewlines(input: string | null | undefined): string {
  if (!input) return "";
  return String(input)
    // Escaped CRLF variants first
    .replace(/\\r\\n/g, "\n")
    .replace(/\\r/g, "\n")
    // Escaped `\n` -> real newline
    .replace(/\\n/g, "\n")
    // Windows CRLF -> LF
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

/** True when CMS value already contains HTML tags (Strapi richtext). */
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
