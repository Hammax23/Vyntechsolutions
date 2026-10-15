/** Cover images come from several places (Unsplash, Strapi uploads, the /blogpost panel). */
export const BLOG_PLACEHOLDER = "/logo.png";

/** next/image can only optimise whitelisted hosts; serve everything else as-is. */
export function blogImageUnoptimized(src: string): boolean {
  return !/^https:\/\/(images\.unsplash\.com|flagcdn\.com|cdn\.jsdelivr\.net)\//.test(src) && !src.startsWith("/images/");
}
