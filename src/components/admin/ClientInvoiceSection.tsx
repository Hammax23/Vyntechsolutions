"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  BillingInvoiceData,
  BillingInvoiceStatus,
  BillingLineItem,
} from "@/lib/admin/billing-invoice-types";
import {
  BILLING_PAYMENT_METHODS,
  BILLING_STATUSES,
  calculateBillingTotals,
  formatCad,
  generateInvoiceNumber,
  lineAmount,
} from "@/lib/admin/billing-invoice-types";
import { createDefaultBillingInvoice } from "@/lib/admin/billing-invoice-defaults";
import { getDocumentVerifyUrl } from "@/lib/admin/invoice-verify";

type Props = { sidebarOpen: boolean };

const STATUS_COLORS: Record<BillingInvoiceStatus, string> = {
  draft: "bg-white/10 text-white/60",
  sent: "bg-sky-500/20 text-sky-300",
  paid: "bg-emerald-500/20 text-emerald-300",
  overdue: "bg-red-500/20 text-red-300",
  cancelled: "bg-amber-500/20 text-amber-300",
};

export default function ClientInvoiceSection({ sidebarOpen }: Props) {
  const [invoices, setInvoices] = useState<BillingInvoiceData[]>([]);
  const [form, setForm] = useState<BillingInvoiceData>(createDefaultBillingInvoice());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const totals = useMemo(() => calculateBillingTotals(form), [form]);
  const verifyUrl = useMemo(() => {
    if (!form.invoiceNumber) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : undefined;
    return getDocumentVerifyUrl(form.invoiceNumber, origin);
  }, [form.invoiceNumber]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/billing-invoices");
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
      }
    } catch {
      setMessage("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = <K extends keyof BillingInvoiceData>(key: K, value: BillingInvoiceData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateLine = (index: number, patch: Partial<BillingLineItem>) => {
    setForm((prev) => {
      const lineItems = [...prev.lineItems];
      lineItems[index] = { ...lineItems[index], ...patch };
      return { ...prev, lineItems };
    });
  };

  const addLine = () => {
    set("lineItems", [...form.lineItems, { description: "", quantity: 1, rate: 0 }]);
  };

  const removeLine = (index: number) => {
    const remaining = form.lineItems.filter((_, i) => i !== index);
    set(
      "lineItems",
      remaining.length ? remaining : [{ description: "", quantity: 1, rate: 0 }]
    );
  };

  const reset = () => {
    setForm(createDefaultBillingInvoice());
    setMessage("");
  };

  const select = (inv: BillingInvoiceData) => {
    setForm({
      ...inv,
      lineItems: inv.lineItems?.length
        ? inv.lineItems
        : [{ description: "", quantity: 1, rate: 0 }],
    });
    setMessage("");
  };

  const save = async (): Promise<BillingInvoiceData | null> => {
    if (!form.clientName.trim()) {
      setMessage("Client name is required");
      return null;
    }
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/billing-invoices", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setForm(data.invoice);
      setMessage("Invoice saved");
      load();
      return data.invoice as BillingInvoiceData;
    } catch {
      setMessage("Save failed — run prisma migrate if the table is missing");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!form.id || !confirm("Delete this client invoice?")) return;
    await fetch(`/api/admin/billing-invoices?id=${form.id}`, { method: "DELETE" });
    reset();
    load();
    setMessage("Invoice deleted");
  };

  const copyVerifyLink = async () => {
    if (!form.id) {
      setMessage("Save the invoice first to copy the verify link");
      return;
    }
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setMessage("Verify link copied");
    } catch {
      setMessage(verifyUrl);
    }
  };

  const downloadPdf = async () => {
    if (!form.clientName.trim()) {
      setMessage("Client name is required");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      let payload = form;
      const saved = await save();
      if (saved) {
        payload = saved;
      } else if (!form.id) {
        // Save failed (e.g. DB not migrated) — still allow PDF from form data
        setMessage("Could not save to database; generating PDF from current form…");
      }

      const res = await fetch("/api/admin/billing-invoices/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "pdf");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `VynTech-Invoice-${payload.invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage(saved ? "PDF downloaded" : "PDF downloaded (not saved to database)");
    } catch (e) {
      setMessage(e instanceof Error && e.message !== "pdf" ? e.message : "PDF generation failed");
    } finally {
      setBusy(false);
    }
  };

  const input =
    "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-[#00B4FF]/50";
  const label = "block text-white/60 text-xs font-medium mb-1.5";
  const card = "bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3";

  return (
    <div className="flex flex-col xl:flex-row gap-6 min-h-[calc(100vh-8rem)]">
      <div className={`${sidebarOpen ? "xl:w-64" : "xl:w-56"} shrink-0 space-y-4`}>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Invoices</h3>
            <button
              onClick={reset}
              className="text-xs px-2 py-1 bg-[#0055FF] text-white rounded-md"
            >
              + New
            </button>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <p className="p-3 text-white/40 text-sm">Loading...</p>
            ) : invoices.length === 0 ? (
              <p className="p-3 text-white/40 text-sm">No client invoices yet</p>
            ) : (
              invoices.map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => select(inv)}
                  className={`w-full text-left p-3 border-b border-white/5 hover:bg-white/5 ${
                    form.id === inv.id ? "bg-[#0055FF]/15" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${
                        STATUS_COLORS[inv.status] || STATUS_COLORS.draft
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <p className="text-white text-sm truncate">{inv.clientName}</p>
                  <p className="text-white/40 text-xs">{inv.invoiceNumber}</p>
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
          {totals.discount > 0 && (
            <div className="flex justify-between text-white/70">
              <span>Discount</span>
              <span>-{formatCad(totals.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-white/70">
            <span>HST</span>
            <span>{formatCad(totals.hst)}</span>
          </div>
          <div className="flex justify-between text-white font-bold border-t border-white/10 pt-2">
            <span>Total</span>
            <span className="text-[#00E1FF]">{formatCad(totals.total)}</span>
          </div>
          <div className="flex justify-between text-white/70">
            <span>Balance</span>
            <span>{formatCad(totals.balance)}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {message && (
          <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80">
            {message}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => save()}
            disabled={saving}
            className="px-4 py-2 bg-[#0055FF] hover:bg-[#0044CC] text-white text-sm rounded-lg disabled:opacity-50"
          >
            {saving ? "Saving..." : form.id ? "Update Invoice" : "Save Invoice"}
          </button>
          <button
            onClick={downloadPdf}
            disabled={busy}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm rounded-lg disabled:opacity-50"
          >
            {busy ? "Preparing..." : "Download PDF"}
          </button>
          <button
            onClick={copyVerifyLink}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-sm rounded-lg"
          >
            Copy Verify Link
          </button>
          {form.id && (
            <button
              onClick={remove}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 text-sm rounded-lg"
            >
              Delete
            </button>
          )}
          <button
            onClick={() => set("invoiceNumber", generateInvoiceNumber())}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 text-xs rounded-lg ml-auto"
            title="Generate new invoice number"
          >
            New #
          </button>
        </div>

        <div className={card}>
          <h4 className="text-white font-semibold text-sm">Invoice Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className={label}>Invoice Number</label>
              <input className={input} value={form.invoiceNumber} onChange={(e) => set("invoiceNumber", e.target.value)} />
            </div>
            <div>
              <label className={label}>Status</label>
              <select
                className={input}
                value={form.status}
                onChange={(e) => set("status", e.target.value as BillingInvoiceStatus)}
              >
                {BILLING_STATUSES.map((s) => (
                  <option key={s.value} value={s.value} className="bg-[#0a0a1a]">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Issue Date</label>
              <input className={input} type="date" value={form.issueDate} onChange={(e) => set("issueDate", e.target.value)} />
            </div>
            <div>
              <label className={label}>Due Date</label>
              <input className={input} type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
            </div>
          </div>
        </div>

        <div className={card}>
          <h4 className="text-white font-semibold text-sm">Bill To</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={label}>Client Name *</label>
              <input className={input} value={form.clientName} placeholder="John Smith" onChange={(e) => set("clientName", e.target.value)} />
            </div>
            <div>
              <label className={label}>Company</label>
              <input className={input} value={form.companyName} placeholder="Acme Inc." onChange={(e) => set("companyName", e.target.value)} />
            </div>
            <div>
              <label className={label}>Email</label>
              <input className={input} type="email" value={form.clientEmail} placeholder="client@company.com" onChange={(e) => set("clientEmail", e.target.value)} />
            </div>
            <div>
              <label className={label}>Phone</label>
              <input className={input} value={form.clientPhone} placeholder="+1 (416) 000-0000" onChange={(e) => set("clientPhone", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className={label}>Billing Address</label>
              <input className={input} value={form.clientAddress} placeholder="Street, City, Province, Postal" onChange={(e) => set("clientAddress", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className={label}>Project / Service Title</label>
              <input className={input} value={form.projectTitle} placeholder="Website Redesign — Phase 1" onChange={(e) => set("projectTitle", e.target.value)} />
            </div>
          </div>
        </div>

        <div className={card}>
          <div className="flex items-center justify-between">
            <h4 className="text-white font-semibold text-sm">Line Items</h4>
            <button
              type="button"
              onClick={addLine}
              className="text-xs px-2 py-1 bg-white/10 hover:bg-white/15 text-white rounded-md"
            >
              + Add Line
            </button>
          </div>
          <div className="hidden md:grid grid-cols-[1fr_90px_110px_110px_28px] gap-2 text-white/40 text-[11px] uppercase tracking-wide px-1">
            <span>Description</span>
            <span>Qty</span>
            <span>Rate (CAD)</span>
            <span className="text-right">Amount</span>
            <span />
          </div>
          <div className="space-y-2">
            {form.lineItems.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-[1fr_90px_110px_110px_28px] gap-2 items-center bg-white/[0.03] border border-white/10 rounded-lg p-2.5"
              >
                <input
                  className={input}
                  value={item.description}
                  placeholder="Service or deliverable"
                  onChange={(e) => updateLine(i, { description: e.target.value })}
                />
                <input
                  className={input}
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.quantity}
                  onChange={(e) => updateLine(i, { quantity: Number(e.target.value) })}
                />
                <input
                  className={input}
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.rate}
                  onChange={(e) => updateLine(i, { rate: Number(e.target.value) })}
                />
                <div className="text-right text-sm text-white/80 px-1">
                  {formatCad(lineAmount(item))}
                </div>
                <button
                  type="button"
                  className="text-red-400 hover:text-red-300 text-lg leading-none h-9"
                  title="Remove"
                  onClick={() => removeLine(i)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={card}>
            <h4 className="text-white font-semibold text-sm">Totals & Payment</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Discount %</label>
                <input
                  className={input}
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.discountPercent}
                  onChange={(e) => set("discountPercent", Number(e.target.value))}
                />
              </div>
              <div>
                <label className={label}>HST %</label>
                <input
                  className={input}
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.hstPercent}
                  onChange={(e) => set("hstPercent", Number(e.target.value))}
                />
              </div>
              <div>
                <label className={label}>Amount Paid</label>
                <input
                  className={input}
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.amountPaid}
                  onChange={(e) => set("amountPaid", Number(e.target.value))}
                />
              </div>
              <div>
                <label className={label}>Payment Method</label>
                <select
                  className={input}
                  value={form.paymentMethod}
                  onChange={(e) => set("paymentMethod", e.target.value)}
                >
                  {BILLING_PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m} className="bg-[#0a0a1a]">
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className={card}>
            <h4 className="text-white font-semibold text-sm">Terms & Notes</h4>
            <div>
              <label className={label}>Payment Terms</label>
              <textarea
                className={`${input} min-h-[72px] resize-y`}
                value={form.paymentTerms}
                onChange={(e) => set("paymentTerms", e.target.value)}
              />
            </div>
            <div>
              <label className={label}>Internal / Client Notes</label>
              <textarea
                className={`${input} min-h-[72px] resize-y`}
                value={form.notes}
                placeholder="Optional notes shown on the PDF"
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
