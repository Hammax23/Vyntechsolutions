export type OptionalService = {
  service: string;
  price: string;
  amount?: number | null;
};

export type ScopeSection = {
  title: string;
  items: string[];
};

export type ClientSelections = {
  optionalIndexes: number[];
  socialMediaSelected: boolean;
  clientNote?: string;
  submittedAt?: string;
};

export type QuotationData = {
  id?: string;
  quoteNumber: string;
  customerName: string;
  companyName: string;
  quoteDate: string;
  projectTitle: string;
  projectSubtitle: string;
  introText: string;
  projectType: string;
  technology: string;
  totalPages: string;
  timeline: string;
  scopeSections: ScopeSection[];
  includes: string[];
  optionalServices: OptionalService[];
  showSocialMedia: boolean;
  socialMediaFee: number;
  socialIncludes: string[];
  baseAmount: number;
  discountPercent: number;
  hstPercent: number;
  depositPercent: number;
  terms: string[];
  status?: string;
  shareToken?: string | null;
  shareExpiresAt?: string | null;
  clientSelections?: ClientSelections;
};

export type QuotationTotals = {
  discount: number;
  subtotal: number;
  hst: number;
  total: number;
  deposit: number;
  balance: number;
};

export function flattenScope(sections: ScopeSection[]): string[] {
  return sections.flatMap((s) => s.items.map((i) => i.trim()).filter(Boolean));
}

export function calculateQuotationTotals(
  data: Pick<QuotationData, "baseAmount" | "discountPercent" | "hstPercent" | "depositPercent">,
  addons = 0
): QuotationTotals {
  const gross = data.baseAmount + addons;
  const discount = round2(gross * (data.discountPercent / 100));
  const subtotal = round2(gross - discount);
  const hst = round2(subtotal * (data.hstPercent / 100));
  const total = round2(subtotal + hst);
  const deposit = round2(total * (data.depositPercent / 100));
  return { discount, subtotal, hst, total, deposit, balance: round2(total - deposit) };
}

export function sumOptionalAddons(services: OptionalService[], indexes: number[]): number {
  return indexes.reduce((sum, i) => {
    const amount = services[i]?.amount;
    return amount && amount > 0 ? sum + amount : sum;
  }, 0);
}

export function formatCad(amount: number): string {
  return `$${amount.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function generateQuoteNumber(): string {
  return `VTS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function generateShareToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
