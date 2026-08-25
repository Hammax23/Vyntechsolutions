/** Public company contact details used across the site. */
export const COMPANY_PHONE_DISPLAY = "+1 (877) 879-6061";
export const COMPANY_PHONE_TEL = "+18778796061";
export const COMPANY_PHONE_E164 = "+1-877-879-6061";
export const COMPANY_EMAIL = "info@vyntechsolutions.ca";
export const SITE_URL = "https://vyntechsolutions.ca";

/** Prefer CMS org/global values; fall back to site defaults. */
export function resolveCompanyEmail(cmsEmail?: string | null): string {
  const value = typeof cmsEmail === "string" ? cmsEmail.trim() : "";
  return value || COMPANY_EMAIL;
}

export function resolveCompanyPhoneDisplay(cmsPhone?: string | null): string {
  const value = typeof cmsPhone === "string" ? cmsPhone.trim() : "";
  if (!value) return COMPANY_PHONE_DISPLAY;
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return value;
}

export function resolveCompanyPhoneTel(cmsPhone?: string | null): string {
  const value = typeof cmsPhone === "string" ? cmsPhone.trim() : "";
  if (!value) return COMPANY_PHONE_TEL;
  const digits = value.replace(/\D/g, "");
  return digits ? `+${digits}` : COMPANY_PHONE_TEL;
}
