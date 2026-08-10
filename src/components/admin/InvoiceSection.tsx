"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ExpenseType, InvoiceData, InvoiceLineItem } from "@/lib/admin/invoice-types";
import {
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  calculateInvoiceTotals,
  formatCad,
  generateDocumentNumber,
} from "@/lib/admin/invoice-types";
import { createDefaultInvoice } from "@/lib/admin/invoice-defaults";
import { getDocumentVerifyUrl } from "@/lib/admin/invoice-verify";

type Props = { sidebarOpen: boolean };

export default function InvoiceSection({ sidebarOpen }: Props) {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [form, setForm] = useState<InvoiceData>(createDefaultInvoice("salary"));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const totals = useMemo(() => calculateInvoiceTotals(form), [form]);
  const isSalary = form.expenseType === "salary";
  const verifyUrl = useMemo(() => {
    if (!form.documentNumber) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : undefined;
    return getDocumentVerifyUrl(form.documentNumber, origin);
  }, [form.documentNumber]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/invoices");
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
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

  const set = <K extends keyof InvoiceData>(key: K, value: InvoiceData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const switchType = (type: ExpenseType) => {
    if (form.id) {
      setMessage("New document banao type change ke liye (current save pe type change nahi)");
      return;
    }
    setForm(createDefaultInvoice(type));
    setMessage("");
  };

  const updateLine = (index: number, patch: Partial<InvoiceLineItem>) => {
    setForm((prev) => {
      const lineItems = [...prev.lineItems];
      lineItems[index] = { ...lineItems[index], ...patch };
      return { ...prev, lineItems };
    });
  };

  const addLine = (kind: InvoiceLineItem["kind"]) => {
    set("lineItems", [...form.lineItems, { description: "", amount: 0, kind }]);
  };

  const removeLine = (index: number) => {
    const remaining = form.lineItems.filter((_, i) => i !== index);
    if (remaining.length === 0) {
      set("lineItems", [
        {
          description: "",
          amount: 0,
          kind: isSalary ? "earning" : "expense",
        },
      ]);
      return;
    }
    set("lineItems", remaining);
  };

  const reset = (type: ExpenseType = form.expenseType) => {
    setForm(createDefaultInvoice(type));
    setMessage("");
  };

  const select = (inv: InvoiceData) => {
    setForm({
      ...inv,
      lineItems: inv.lineItems?.length
        ? inv.lineItems
        : [{ description: "", amount: 0, kind: inv.expenseType === "salary" ? "earning" : "expense" }],
    });
    setMessage("");
  };

  const save = async (): Promise<InvoiceData | null> => {
    if (!form.payeeName.trim()) {
      setMessage(isSalary ? "Employee name required" : "Payee name required");
      return null;
    }
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/invoices", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setForm(data.invoice);
      setMessage("Saved");
      load();
      return data.invoice as InvoiceData;
    } catch {
      setMessage("Save failed — run DB migration if table is outdated");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!form.id || !confirm("Delete this document?")) return;
    await fetch(`/api/admin/invoices?id=${form.id}`, { method: "DELETE" });
    reset(form.expenseType);
    load();
    setMessage("Deleted");
  };

  const copyVerifyLink = async () => {
    if (!form.id) {
      setMessage("Pehle Save karo — phir verify link copy hoga");
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
    if (!form.payeeName.trim()) {
      setMessage(isSalary ? "Employee name required" : "Payee name required");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      // Must exist in DB so QR verification works
      let payload = form;
      if (!form.id) {
        const saved = await save();
        if (!saved) throw new Error("save");
        payload = saved;
      } else {
        const saved = await save();
        if (saved) payload = saved;
      }

      const res = await fetch("/api/admin/invoices/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const prefix = payload.expenseType === "salary" ? "Salary" : "Expense";
      a.download = `VynTech-${prefix}-${payload.documentNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage("PDF downloaded — QR verify link included");
    } catch {
      setMessage("PDF failed");
    } finally {
      setBusy(false);
    }
  };

  const earnings = form.lineItems
    .map((item, i) => ({ item, i }))
    .filter(({ item }) => item.kind === "earning");
  const deductions = form.lineItems
    .map((item, i) => ({ item, i }))
    .filter(({ item }) => item.kind === "deduction");
  const expenses = form.lineItems
    .map((item, i) => ({ item, i }))
    .filter(({ item }) => item.kind === "expense");

  const input =
    "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-[#00B4FF]/50";
  const label = "block text-white/60 text-xs font-medium mb-1.5";
  const card = "bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3";

  const renderAmountRows = (
    rows: { item: InvoiceLineItem; i: number }[],
    emptyHint: string
  ) =>
    rows.length === 0 ? (
      <p className="text-sm text-white/40 py-1">{emptyHint}</p>
    ) : (
      <div className="space-y-2">
        {rows.map(({ item, i }) => (
          <div
            key={i}
            className="grid grid-cols-1 md:grid-cols-[1fr_120px_28px] gap-2 items-center bg-white/[0.03] border border-white/10 rounded-lg p-2.5"
          >
            <input
              className={input}
              value={item.description}
              placeholder="Description"
              onChange={(e) => updateLine(i, { description: e.target.value })}
            />
            <input
              className={input}
              type="number"
              min={0}
              step="0.01"
              value={item.amount}
              onChange={(e) => updateLine(i, { amount: Number(e.target.value) })}
            />
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
    );

  return (
    <div className="flex flex-col xl:flex-row gap-6 min-h-[calc(100vh-8rem)]">
      <div className={`${sidebarOpen ? "xl:w-64" : "xl:w-56"} shrink-0 space-y-4`}>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Documents</h3>
            <button onClick={() => reset(form.expenseType)} className="text-xs px-2 py-1 bg-[#0055FF] text-white rounded-md">
              + New
            </button>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <p className="p-3 text-white/40 text-sm">Loading...</p>
            ) : invoices.length === 0 ? (
              <p className="p-3 text-white/40 text-sm">No expenses yet</p>
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
                        inv.expenseType === "salary"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {inv.expenseType === "salary" ? "Salary" : "Expense"}
                    </span>
                  </div>
                  <p className="text-white text-sm truncate">{inv.payeeName}</p>
                  <p className="text-white/40 text-xs">{inv.documentNumber}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="bg-[#0055FF]/15 border border-[#00B4FF]/20 rounded-xl p-4 text-sm space-y-2">
          {isSalary ? (
            <>
              <div className="flex justify-between text-white/70">
                <span>Earnings</span>
                <span>{formatCad(totals.earnings)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Deductions</span>
                <span>-{formatCad(totals.deductions)}</span>
              </div>
              <div className="flex justify-between text-white font-bold border-t border-white/10 pt-2">
                <span>Net Pay</span>
                <span className="text-[#00E1FF]">{formatCad(totals.netPay)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-white font-bold">
              <span>Total</span>
              <span className="text-[#00E1FF]">{formatCad(totals.total)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {message && (
          <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80">{message}</div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            <button
              type="button"
              onClick={() => switchType("salary")}
              className={`px-3 py-2 text-sm ${isSalary ? "bg-[#0055FF] text-white" : "bg-white/5 text-white/60"}`}
            >
              Salary
            </button>
            <button
              type="button"
              onClick={() => switchType("expense")}
              className={`px-3 py-2 text-sm ${!isSalary ? "bg-[#0055FF] text-white" : "bg-white/5 text-white/60"}`}
            >
              Other Expense
            </button>
          </div>
          <button
            onClick={downloadPdf}
            disabled={busy}
            className="px-3 py-2 bg-[#0055FF] text-white text-sm rounded-lg disabled:opacity-50"
          >
            {busy ? "..." : isSalary ? "Download Salary PDF" : "Download Expense PDF"}
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-3 py-2 bg-emerald-600 text-white text-sm rounded-lg disabled:opacity-50"
          >
            {saving ? "..." : form.id ? "Update" : "Save"}
          </button>
          {form.id && (
            <button onClick={remove} className="px-3 py-2 bg-red-500/20 text-red-400 text-sm rounded-lg">
              Delete
            </button>
          )}
          {form.id && (
            <button
              type="button"
              onClick={copyVerifyLink}
              className="px-3 py-2 bg-violet-600 text-white text-sm rounded-lg"
            >
              Copy Verify Link
            </button>
          )}
        </div>

        {form.id && verifyUrl && (
          <div className="px-3 py-2 bg-violet-500/10 border border-violet-500/30 rounded-lg text-xs text-white/70 break-all">
            <span className="text-violet-300 font-medium">Verify: </span>
            <a href={verifyUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white underline">
              {verifyUrl}
            </a>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-4">          <div className={card}>
            <h4 className="text-white font-semibold text-sm">{isSalary ? "Employee" : "Payee"}</h4>
            <div>
              <label className={label}>Name *</label>
              <input className={input} value={form.payeeName} onChange={(e) => set("payeeName", e.target.value)} />
            </div>
            <div>
              <label className={label}>{isSalary ? "Role / Title" : "Company / Role"}</label>
              <input className={input} value={form.payeeRole} onChange={(e) => set("payeeRole", e.target.value)} />
            </div>
            <div>
              <label className={label}>Email</label>
              <input
                className={input}
                type="email"
                value={form.payeeEmail}
                onChange={(e) => set("payeeEmail", e.target.value)}
              />
            </div>
          </div>

          <div className={card}>
            <h4 className="text-white font-semibold text-sm">Document</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Document #</label>
                <input
                  className={input}
                  value={form.documentNumber}
                  onChange={(e) => set("documentNumber", e.target.value)}
                />
              </div>
              <div>
                <label className={label}>Issue Date</label>
                <input
                  type="date"
                  className={input}
                  value={form.issueDate}
                  onChange={(e) => set("issueDate", e.target.value)}
                />
              </div>
              {isSalary ? (
                <div className="col-span-2">
                  <label className={label}>Pay Period</label>
                  <input
                    className={input}
                    value={form.periodLabel}
                    placeholder="August 2026"
                    onChange={(e) => set("periodLabel", e.target.value)}
                  />
                </div>
              ) : (
                <div className="col-span-2">
                  <label className={label}>Category</label>
                  <select className={input} value={form.category} onChange={(e) => set("category", e.target.value)}>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-[#0a0a1a]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="col-span-2">
                <label className={label}>Payment Method</label>
                <select
                  className={input}
                  value={form.paymentMethod}
                  onChange={(e) => set("paymentMethod", e.target.value)}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m} className="bg-[#0a0a1a]">
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {!form.id && (
              <button
                type="button"
                onClick={() => set("documentNumber", generateDocumentNumber(form.expenseType))}
                className="text-xs text-white/40 hover:text-white/70"
              >
                New document #
              </button>
            )}
          </div>
        </div>

        {isSalary ? (
          <>
            <div className={card}>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-white font-semibold text-sm">Earnings</h4>
                <button
                  type="button"
                  onClick={() => addLine("earning")}
                  className="text-xs px-2.5 py-1 bg-[#0055FF]/30 text-[#00B4FF] rounded-md hover:bg-[#0055FF]/50"
                >
                  + Add Earning
                </button>
              </div>
              {renderAmountRows(earnings, "No earnings yet")}
            </div>
            <div className={card}>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-white font-semibold text-sm">Deductions</h4>
                <button
                  type="button"
                  onClick={() => addLine("deduction")}
                  className="text-xs px-2.5 py-1 bg-[#0055FF]/30 text-[#00B4FF] rounded-md hover:bg-[#0055FF]/50"
                >
                  + Add Deduction
                </button>
              </div>
              {renderAmountRows(deductions, "No deductions")}
            </div>
          </>
        ) : (
          <div className={card}>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-white font-semibold text-sm">Expense Items</h4>
              <button
                type="button"
                onClick={() => addLine("expense")}
                className="text-xs px-2.5 py-1 bg-[#0055FF]/30 text-[#00B4FF] rounded-md hover:bg-[#0055FF]/50"
              >
                + Add Line
              </button>
            </div>
            {renderAmountRows(expenses, "No expense lines")}
          </div>
        )}

        <div className={card}>
          <h4 className="text-white font-semibold text-sm">Notes</h4>
          <textarea
            className={`${input} min-h-[80px] resize-y`}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
