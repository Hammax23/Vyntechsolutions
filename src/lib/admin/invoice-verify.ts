import { SITE_URL } from "@/lib/company";

/** Public verification URL for company expense / salary documents (always production site by default). */
export function getDocumentVerifyUrl(documentNumber: string, origin?: string): string {
  const base = (origin || process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/$/, "");
  return `${base}/verify/${encodeURIComponent(documentNumber)}`;
}
