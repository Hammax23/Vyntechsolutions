"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { QuotationData, ScopeSection } from "@/lib/admin/quotation-types";
import { calculateQuotationTotals, formatCad, generateQuoteNumber } from "@/lib/admin/quotation-types";
import { createDefaultQuotation, DEFAULT_SCOPE } from "@/lib/admin/quotation-defaults";

type Props = { sidebarOpen: boolean };

function sectionsFromForm(sections: ScopeSection[]): ScopeSection[] {
  const base = sections?.length ? sections : DEFAULT_SCOPE;
  return [0, 1, 2].map((i) => ({
    title: base[i]?.title || ["Frontend", "Backend", "Delivery"][i],
    items: base[i]?.items?.length ? [...base[i].items] : [""],
  }));
}

function linesToItems(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export default function OfferLetterSection({ sidebarOpen }: Props) {
  const [quotations, setQuotations] = useState<QuotationData[]>([]);
  const [form, setForm] = useState<QuotationData>(createDefaultQuotation());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [message, setMessage] = useState("");

  const totals = useMemo(() => calculateQuotationTotals(form), [form]);
  const sections = useMemo(() => sectionsFromForm(form.scopeSections), [form.scopeSections]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/quotations");
      if (res.ok) {
        const data = await res.json();
        setQuotations(data.quotations || []);
      }
    } catch {
      setMessage("Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = <K extends keyof QuotationData>(key: K, value: QuotationData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setScopeTitle = (index: number, title: string) => {
    setForm((prev) => {
      const next = sectionsFromForm(prev.scopeSections);
      next[index] = { ...next[index], title };
      return { ...prev, scopeSections: next };
    });
  };

  const setScopeText = (index: number, text: string) => {
    setForm((prev) => {
      const next = sectionsFromForm(prev.scopeSections);
      next[index] = { ...next[index], items: linesToItems(text) };
      return { ...prev, scopeSections: next };
    });
  };

  const reset = () => {
    setForm(createDefaultQuotation());
    setShareUrl("");
    setMessage("");
  };

  const select = (q: QuotationData) => {
    setForm({ ...q, scopeSections: sectionsFromForm(q.scopeSections) });
    setShareUrl(q.shareToken ? `${window.location.origin}/quote/${q.shareToken}` : "");
    setMessage("");
  };

  const save = async () => {
    if (!form.customerName.trim()) {
      setMessage("Customer name required");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/quotations", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          optionalServices: form.optionalServices.filter((o) => o.service.trim()),
          terms: form.terms.filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setForm({ ...data.quotation, scopeSections: sectionsFromForm(data.quotation.scopeSections) });
      setMessage("Saved");
      load();
    } catch {
      setMessage("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!form.id || !confirm("Delete this offer?")) return;
    await fetch(`/api/admin/quotations?id=${form.id}`, { method: "DELETE" });
    reset();
    load();
    setMessage("Deleted");
  };

  const share = async () => {
    if (!form.id) {
      setMessage("Save first, then share");
      return;
    }
    setBusy("share");
    try {
      const res = await fetch("/api/admin/quotations/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: form.id }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setShareUrl(data.shareUrl);
      setForm((prev) => ({ ...prev, shareToken: data.shareToken, status: "shared" }));
      await navigator.clipboard.writeText(data.shareUrl);
      setMessage("Share link copied");
      load();
    } catch {
      setMessage("Share failed");
    } finally {
      setBusy(null);
    }
  };

  const downloadPdf = async (variant: "client" | "internal") => {
    if (!form.customerName.trim()) {
      setMessage("Customer name required");
      return;
    }
    setBusy(variant);
    try {
      const res = await fetch("/api/admin/quotations/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: form, variant }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `VynTech-Offer-${form.quoteNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setMessage("PDF failed");
    } finally {
      setBusy(null);
    }
  };

  const input =
    "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-[#00B4FF]/50";
  const label = "block text-white/60 text-xs font-medium mb-1.5";
  const card = "bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3";

  return (
    <div className="flex flex-col xl:flex-row gap-6 min-h-[calc(100vh-8rem)]">
      {/* Sidebar list */}
      <div className={`${sidebarOpen ? "xl:w-64" : "xl:w-56"} shrink-0 space-y-4`}>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Offers</h3>
            <button onClick={reset} className="text-xs px-2 py-1 bg-[#0055FF] text-white rounded-md">
              + New
            </button>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <p className="p-3 text-white/40 text-sm">Loading...</p>
            ) : quotations.length === 0 ? (
              <p className="p-3 text-white/40 text-sm">No offers yet</p>
            ) : (
              quotations.map((q) => (
                <button
                  key={q.id}
                  onClick={() => select(q)}
                  className={`w-full text-left p-3 border-b border-white/5 hover:bg-white/5 ${
                    form.id === q.id ? "bg-[#0055FF]/15" : ""
                  }`}
                >
                  <p className="text-white text-sm truncate">{q.customerName}</p>
                  <p className="text-white/40 text-xs">{q.quoteNumber}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="bg-[#0055FF]/15 border border-[#00B4FF]/20 rounded-xl p-4 text-sm space-y-2">
          <div className="flex justify-between text-white/70">
            <span>Subtotal</span>
            <span>{formatCad(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-white/70">
            <span>HST</span>
            <span>{formatCad(totals.hst)}</span>
          </div>
          <div className="flex justify-between text-white font-bold border-t border-white/10 pt-2">
            <span>Total</span>
            <span className="text-[#00E1FF]">{formatCad(totals.total)}</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 space-y-4">
        {message && <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80">{message}</div>}

        <div className="flex flex-wrap gap-2">
          <button onClick={() => downloadPdf("client")} disabled={!!busy} className="px-3 py-2 bg-[#0055FF] text-white text-sm rounded-lg disabled:opacity-50">
            {busy === "client" ? "..." : "Download Proposal PDF"}
          </button>
          <button onClick={() => downloadPdf("internal")} disabled={!!busy} className="px-3 py-2 bg-amber-600 text-white text-sm rounded-lg disabled:opacity-50">
            Internal PDF
          </button>
          {form.id && (
            <button onClick={share} disabled={!!busy} className="px-3 py-2 bg-violet-600 text-white text-sm rounded-lg disabled:opacity-50">
              {busy === "share" ? "..." : "Share Link"}
            </button>
          )}
          <button onClick={save} disabled={saving} className="px-3 py-2 bg-emerald-600 text-white text-sm rounded-lg disabled:opacity-50">
            {saving ? "..." : form.id ? "Update" : "Save"}
          </button>
          {form.id && (
            <button onClick={remove} className="px-3 py-2 bg-red-500/20 text-red-400 text-sm rounded-lg">
              Delete
            </button>
          )}
        </div>

        {shareUrl && (
          <div className="px-3 py-2 bg-violet-500/10 border border-violet-500/30 rounded-lg text-xs text-white/70 break-all">
            {shareUrl}
          </div>
        )}

        {form.clientSelections?.submittedAt && (
          <div className="px-3 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm text-emerald-300">
            Client replied {new Date(form.clientSelections.submittedAt).toLocaleString("en-CA")}
            {form.clientSelections.clientNote ? ` — "${form.clientSelections.clientNote}"` : ""}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-4">
          <div className={card}>
            <h4 className="text-white font-semibold text-sm">Client</h4>
            <div>
              <label className={label}>Name *</label>
              <input className={input} value={form.customerName} onChange={(e) => set("customerName", e.target.value)} />
            </div>
            <div>
              <label className={label}>Company</label>
              <input className={input} value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Quote #</label>
                <input className={input} value={form.quoteNumber} onChange={(e) => set("quoteNumber", e.target.value)} />
              </div>
              <div>
                <label className={label}>Date</label>
                <input type="date" className={input} value={form.quoteDate} onChange={(e) => set("quoteDate", e.target.value)} />
              </div>
            </div>
          </div>

          <div className={card}>
            <h4 className="text-white font-semibold text-sm">Engagement</h4>
            <div>
              <label className={label}>Engagement Type</label>
              <input className={input} value={form.projectType} onChange={(e) => set("projectType", e.target.value)} />
            </div>
            <div>
              <label className={label}>Technology Stack</label>
              <input className={input} value={form.technology} onChange={(e) => set("technology", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Estimated Scope</label>
                <input className={input} value={form.totalPages} onChange={(e) => set("totalPages", e.target.value)} />
              </div>
              <div>
                <label className={label}>Estimated Timeline</label>
                <input className={input} value={form.timeline} onChange={(e) => set("timeline", e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className={card}>
          <h4 className="text-white font-semibold text-sm mb-1">Scope of Work</h4>
          <p className="text-xs text-white/40 mb-3">One deliverable per line · Discovery / Development / Launch</p>
          <div className="grid md:grid-cols-3 gap-3">
            {sections.map((section, i) => (
              <div key={i} className="space-y-2">
                <input className={input} value={section.title} onChange={(e) => setScopeTitle(i, e.target.value)} />
                <textarea
                  className={`${input} min-h-[140px] resize-y`}
                  value={section.items.join("\n")}
                  onChange={(e) => setScopeText(i, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className={card}>
            <h4 className="text-white font-semibold text-sm">Commercials</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Base (CAD)</label>
                <input type="number" className={input} value={form.baseAmount} onChange={(e) => set("baseAmount", Number(e.target.value))} />
              </div>
              <div>
                <label className={label}>Discount %</label>
                <input type="number" className={input} value={form.discountPercent} onChange={(e) => set("discountPercent", Number(e.target.value))} />
              </div>
              <div>
                <label className={label}>HST %</label>
                <input type="number" className={input} value={form.hstPercent} onChange={(e) => set("hstPercent", Number(e.target.value))} />
              </div>
              <div>
                <label className={label}>Deposit %</label>
                <input type="number" className={input} value={form.depositPercent} onChange={(e) => set("depositPercent", Number(e.target.value))} />
              </div>
            </div>
            <button type="button" onClick={() => set("quoteNumber", generateQuoteNumber())} className="text-xs text-white/40 hover:text-white/70">
              New quote #
            </button>
          </div>

          <div className={card}>
            <h4 className="text-white font-semibold text-sm">Terms</h4>
            <textarea
              className={`${input} min-h-[140px] resize-y`}
              value={form.terms.join("\n")}
              onChange={(e) => set("terms", linesToItems(e.target.value))}
            />
            <p className="text-xs text-white/40">One term per line</p>
          </div>
        </div>

        <div className={card}>
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-white font-semibold text-sm">Optional Services</h4>
            <button
              type="button"
              onClick={() =>
                set("optionalServices", [
                  ...form.optionalServices,
                  { service: "", price: "Upon Request", amount: null },
                ])
              }
              className="text-xs px-2.5 py-1 bg-[#0055FF]/30 text-[#00B4FF] rounded-md hover:bg-[#0055FF]/50"
            >
              + Add Service
            </button>
          </div>
          <p className="text-xs text-white/40 mb-3">
            Client page pe tickable dikhega. Price label = &quot;Upon Request&quot; ya koi text. CAD amount optional (agar set karo to total mein add hoga).
          </p>

          {form.optionalServices.length === 0 ? (
            <p className="text-sm text-white/40 py-2">No optional services. Click + Add Service.</p>
          ) : (
            <div className="space-y-2">
              <div className="hidden md:grid grid-cols-[1fr_140px_100px_28px] gap-2 px-1">
                <span className="text-[10px] uppercase tracking-wide text-white/35">Service name</span>
                <span className="text-[10px] uppercase tracking-wide text-white/35">Price label</span>
                <span className="text-[10px] uppercase tracking-wide text-white/35">CAD amount</span>
                <span />
              </div>
              {form.optionalServices.map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 md:grid-cols-[1fr_140px_100px_28px] gap-2 items-center bg-white/[0.03] border border-white/10 rounded-lg p-2.5"
                >
                  <input
                    className={input}
                    value={row.service}
                    placeholder="e.g. CRM Integration"
                    onChange={(e) => {
                      const list = [...form.optionalServices];
                      list[i] = { ...list[i], service: e.target.value };
                      set("optionalServices", list);
                    }}
                  />
                  <input
                    className={input}
                    value={row.price}
                    placeholder="Upon Request"
                    onChange={(e) => {
                      const list = [...form.optionalServices];
                      list[i] = { ...list[i], price: e.target.value };
                      set("optionalServices", list);
                    }}
                  />
                  <input
                    className={input}
                    type="number"
                    placeholder="Optional"
                    value={row.amount ?? ""}
                    onChange={(e) => {
                      const list = [...form.optionalServices];
                      const amount = e.target.value === "" ? null : Number(e.target.value);
                      list[i] = {
                        ...list[i],
                        amount,
                        price:
                          amount && amount > 0
                            ? list[i].price === "Upon Request" || !list[i].price
                              ? `$${amount.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`
                              : list[i].price
                            : list[i].price || "Upon Request",
                      };
                      set("optionalServices", list);
                    }}
                  />
                  <button
                    type="button"
                    className="text-red-400 hover:text-red-300 text-lg leading-none h-9"
                    title="Remove"
                    onClick={() => set("optionalServices", form.optionalServices.filter((_, j) => j !== i))}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
