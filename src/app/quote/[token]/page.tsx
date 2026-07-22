"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ClientSelections, QuotationData, ScopeSection } from "@/lib/admin/quotation-types";
import { calculateQuotationTotals, formatCad, sumOptionalAddons } from "@/lib/admin/quotation-types";

type PublicQuote = QuotationData & {
  shareExpiresAt: string | null;
  clientSelections: ClientSelections;
};

function addDays(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function ClientQuotePage({ params }: { params: { token: string } }) {
  const [quote, setQuote] = useState<PublicQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quote/${params.token}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setQuote(data.quotation);
      setSelected(data.quotation.clientSelections?.optionalIndexes || []);
      setNote(data.quotation.clientSelections?.clientNote || "");
      setSubmitted(Boolean(data.quotation.clientSelections?.submittedAt));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [params.token]);

  useEffect(() => {
    load();
  }, [load]);

  const addons = useMemo(
    () => (quote ? sumOptionalAddons(quote.optionalServices, selected) : 0),
    [quote, selected]
  );
  const totals = useMemo(() => (quote ? calculateQuotationTotals(quote, addons) : null), [quote, addons]);

  const submit = async () => {
    if (!quote) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/quote/${params.token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionalIndexes: selected, socialMediaSelected: false, clientNote: note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setQuote(data.quotation);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-slate-500 text-sm">Loading proposal...</div>;
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="text-center max-w-sm">
          <p className="font-semibold text-slate-900 mb-2">Proposal unavailable</p>
          <p className="text-sm text-slate-500 mb-4">{error || "This link is invalid or expired."}</p>
          <Link href="/" className="text-[#1B4F9C] text-sm hover:underline">
            vyntechsolutions.ca
          </Link>
        </div>
      </div>
    );
  }

  const sections: ScopeSection[] =
    quote.scopeSections?.length > 0 ? quote.scopeSections : [{ title: "Scope of Work", items: quote.includes }];
  const issueDate = new Date(quote.quoteDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="VynTech" width={28} height={28} />
            <div>
              <p className="font-bold text-[#0F2A5F] tracking-wide text-sm">VYNTECH SOLUTIONS</p>
              <p className="text-[10px] text-slate-400">Digital Product Engineering</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">{quote.quoteNumber}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-5">
        {submitted && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg px-4 py-3">
            Thank you. Your selections have been recorded. Our team will follow up shortly.
          </div>
        )}

        <section className="bg-white border border-slate-200 rounded-lg p-6 md:p-8">
          <div className="h-1 bg-[#1B4F9C] rounded-sm mb-6" />
          <h1 className="text-xl md:text-2xl font-bold text-[#0F2A5F] tracking-wide mb-5">
            STATEMENT OF WORK & COMMERCIAL PROPOSAL
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 text-sm border border-slate-200 rounded-lg overflow-hidden">
            {[
              ["Reference", quote.quoteNumber],
              ["Issue Date", issueDate],
              ["Valid Until", addDays(quote.quoteDate, 15)],
              ["Currency", "CAD"],
            ].map(([label, value]) => (
              <div key={label} className="bg-slate-50 p-3 border-r border-slate-200 last:border-r-0">
                <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">{label}</p>
                <p className="font-semibold text-slate-800 text-xs md:text-sm">{value}</p>
              </div>
            ))}
          </div>

          <p className="text-sm mb-1">
            <span className="text-slate-500">Prepared for:</span>{" "}
            <strong>{[quote.customerName, quote.companyName].filter(Boolean).join(" · ")}</strong>
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mt-3">
            {quote.introText ||
              "Thank you for considering VynTech Solutions. This document outlines the proposed engagement scope, commercial investment, and acceptance terms."}
          </p>
        </section>

        <section className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-xs font-bold tracking-wide text-[#0F2A5F] mb-4 border-b border-slate-100 pb-2">
            1. ENGAGEMENT OVERVIEW
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-[10px] uppercase text-slate-400">Engagement Type</p>
                <p className="font-semibold">{quote.projectType || quote.projectTitle}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-400">Technology Stack</p>
                <p className="font-semibold">{quote.technology || "—"}</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-[10px] uppercase text-slate-400">Estimated Scope</p>
                <p className="font-semibold">{quote.totalPages || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-400">Estimated Timeline</p>
                <p className="font-semibold">{quote.timeline || "—"}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-xs font-bold tracking-wide text-[#0F2A5F] mb-4 border-b border-slate-100 pb-2">
            2. SCOPE OF WORK
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {sections.map((section) => (
              <div key={section.title}>
                <p className="font-semibold text-sm text-[#1B4F9C] mb-2">{section.title}</p>
                <ul className="space-y-1.5">
                  {section.items.map((item) => (
                    <li key={item} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-[#1B4F9C]">–</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {quote.optionalServices.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-xs font-bold tracking-wide text-[#0F2A5F] mb-2 border-b border-slate-100 pb-2">
              OPTIONAL SERVICES
            </h2>
            <p className="text-sm text-slate-500 mb-3">Select any optional services you wish to include.</p>
            <div className="space-y-2">
              {quote.optionalServices.map((item, i) => {
                const on = selected.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={submitted}
                    onClick={() =>
                      setSelected((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]))
                    }
                    className={`w-full flex justify-between items-center p-3.5 rounded-lg border text-left text-sm ${
                      on ? "border-[#1B4F9C] bg-[#EFF4FB]" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="flex gap-2.5 items-center">
                      <span
                        className={`w-4 h-4 rounded border grid place-items-center text-[10px] ${
                          on ? "bg-[#1B4F9C] border-[#1B4F9C] text-white" : "border-slate-300"
                        }`}
                      >
                        {on ? "✓" : ""}
                      </span>
                      {item.service}
                    </span>
                    <span className="text-[#1B4F9C] font-medium text-xs">
                      {item.amount && item.amount > 0 ? formatCad(item.amount) : item.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {totals && (
          <section className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-6 text-sm">
              <h2 className="text-xs font-bold tracking-wide text-[#0F2A5F] mb-4 border-b border-slate-100 pb-2">
                3. COMMERCIAL INVESTMENT
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span>Professional Services</span>
                  <span>{formatCad(quote.baseAmount)}</span>
                </div>
                {addons > 0 && (
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span>Selected optional services</span>
                    <span>{formatCad(addons)}</span>
                  </div>
                )}
                {quote.discountPercent > 0 && (
                  <div className="flex justify-between py-1.5 border-b border-slate-100 text-red-700 font-medium">
                    <span>Commercial Discount ({quote.discountPercent}%)</span>
                    <span>-{formatCad(totals.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span>HST ({quote.hstPercent}%)</span>
                  <span>{formatCad(totals.hst)}</span>
                </div>
                <div className="flex justify-between pt-3 font-bold text-[#0F2A5F]">
                  <span>Total Investment</span>
                  <span>{formatCad(totals.total)} CAD</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-sm space-y-4">
              <h2 className="text-xs font-bold tracking-wide text-[#0F2A5F]">PAYMENT SCHEDULE</h2>
              <div>
                <p className="font-semibold text-[#1B4F9C] text-xs mb-0.5">
                  Milestone 1 — {quote.depositPercent}% Kickoff
                </p>
                <p>{formatCad(totals.deposit)} CAD upon acceptance</p>
              </div>
              <div>
                <p className="font-semibold text-[#1B4F9C] text-xs mb-0.5">
                  Milestone 2 — {100 - quote.depositPercent}% Delivery
                </p>
                <p>{formatCad(totals.balance)} CAD prior to go-live</p>
              </div>
            </div>
          </section>
        )}

        <section className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-xs font-bold tracking-wide text-[#0F2A5F] mb-3 border-b border-slate-100 pb-2">
            4. TERMS & CONDITIONS
          </h2>
          <ol className="space-y-2 text-sm text-slate-700 list-decimal pl-4">
            {quote.terms.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ol>
        </section>

        {!submitted && (
          <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-3">
            <p className="text-sm text-slate-600">
              Confirm your selections to proceed. Our team will contact you to finalize acceptance.
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Notes or questions (optional)"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1B4F9C]"
            />
            <button
              onClick={submit}
              disabled={submitting}
              className="w-full py-3 bg-[#0F2A5F] text-white font-semibold rounded-lg disabled:opacity-50 hover:bg-[#163A7A]"
            >
              {submitting ? "Submitting..." : "Confirm Proposal Selections"}
            </button>
          </section>
        )}

        <p className="text-center text-[11px] text-slate-400 pb-6">
          Confidential — VynTech Solutions Inc. · {quote.quoteNumber}
        </p>
      </main>
    </div>
  );
}
