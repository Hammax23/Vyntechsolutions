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
  nextInvoiceNumberFromExisting,
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

type ProjectOption = {
  id: string;
  projectName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  companyName: string;
};

type InvoiceKpis = {
  draft: number;
  sent: number;
  overdue: number;
  paidMonth: number;
  outstanding: number;
};

type InvoiceEvent = { id: string; type: string; createdAt: string };

type ProjectInvoiceGroup = {
  key: string;
  projectId: string | null;
  name: string;
  clientLabel: string;
  invoices: BillingInvoiceData[];
  paidCount: number;
  openCount: number;
  draftCount: number;
  paidTotal: number;
  outstanding: number;
};

function projectKeyForInvoice(inv: BillingInvoiceData): string {
  if (inv.projectId) return `id:${inv.projectId}`;
  const title = inv.projectTitle?.trim();
  if (title) return `title:${title.toLowerCase()}`;
  return "unlinked";
}

export default function ClientInvoiceSection({ sidebarOpen }: Props) {
  const [invoices, setInvoices] = useState<BillingInvoiceData[]>([]);
  const [form, setForm] = useState<BillingInvoiceData>(createDefaultBillingInvoice());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BillingInvoiceStatus>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [listMode, setListMode] = useState<"all" | "by_project">("all");
  const [panelMode, setPanelMode] = useState<"dashboard" | "editor">("editor");
  const [dashboardQuery, setDashboardQuery] = useState("");
  const [dashFilter, setDashFilter] = useState<
    "all" | "outstanding" | "fully_paid" | "no_invoices"
  >("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [expandedProjectKey, setExpandedProjectKey] = useState<string | null>(null);
  const [expandedDashKey, setExpandedDashKey] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [kpis, setKpis] = useState<InvoiceKpis | null>(null);
  const [events, setEvents] = useState<InvoiceEvent[]>([]);
  const [sendConfirm, setSendConfirm] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);

  const nextStepHint = useMemo(() => {
    if (!form.id) return "1) Fill details → Save";
    if (form.status === "draft") return "2) Next: Send to client (optional: Send test first)";
    if (form.status === "sent" || form.status === "overdue") {
      return "3) Waiting for pay link / Stripe — or tap Record paid if paid outside";
    }
    if (form.status === "paid") return "Done — invoice is paid";
    if (form.status === "cancelled") return "Cancelled — no further action";
    return "";
  }, [form.id, form.status]);

  const totals = useMemo(() => calculateBillingTotals(form), [form]);
  const verifyUrl = useMemo(() => {
    if (!form.invoiceNumber) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : undefined;
    return getDocumentVerifyUrl(form.invoiceNumber, origin);
  }, [form.invoiceNumber]);

  const projectNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of projects) m.set(p.id, p.projectName);
    return m;
  }, [projects]);

  const projectGroups = useMemo((): ProjectInvoiceGroup[] => {
    const buckets = new Map<string, BillingInvoiceData[]>();
    for (const inv of invoices) {
      const key = projectKeyForInvoice(inv);
      const list = buckets.get(key) || [];
      list.push(inv);
      buckets.set(key, list);
    }

    const groups: ProjectInvoiceGroup[] = [];
    for (const [key, list] of buckets) {
      const sorted = [...list].sort((a, b) =>
        (b.issueDate || "").localeCompare(a.issueDate || "")
      );
      let projectId: string | null = null;
      let name = "No project linked";
      if (key.startsWith("id:")) {
        projectId = key.slice(3);
        name =
          projectNameById.get(projectId) ||
          sorted.find((i) => i.projectTitle?.trim())?.projectTitle?.trim() ||
          "Project";
      } else if (key.startsWith("title:")) {
        const sample = sorted.find((i) => i.projectTitle?.trim());
        name = sample?.projectTitle?.trim() || "Project";
      }

      let paidCount = 0;
      let openCount = 0;
      let draftCount = 0;
      let paidTotal = 0;
      let outstanding = 0;
      for (const inv of sorted) {
        if (inv.status === "paid") {
          paidCount += 1;
          paidTotal += calculateBillingTotals(inv).total;
        } else if (inv.status === "sent" || inv.status === "overdue") {
          openCount += 1;
          outstanding += calculateBillingTotals(inv).balance;
        } else if (inv.status === "draft") {
          draftCount += 1;
        }
      }

      const clientLabel =
        sorted.find((i) => i.clientName?.trim())?.clientName?.trim() ||
        sorted.find((i) => i.companyName?.trim())?.companyName?.trim() ||
        "";

      groups.push({
        key,
        projectId,
        name,
        clientLabel,
        invoices: sorted,
        paidCount,
        openCount,
        draftCount,
        paidTotal: Math.round(paidTotal * 100) / 100,
        outstanding: Math.round(outstanding * 100) / 100,
      });
    }

    for (const p of projects) {
      const key = `id:${p.id}`;
      if (buckets.has(key)) continue;
      groups.push({
        key,
        projectId: p.id,
        name: p.projectName || "Project",
        clientLabel: p.clientName || p.companyName || "",
        invoices: [],
        paidCount: 0,
        openCount: 0,
        draftCount: 0,
        paidTotal: 0,
        outstanding: 0,
      });
    }

    groups.sort((a, b) => {
      if (a.key === "unlinked") return 1;
      if (b.key === "unlinked") return -1;
      return a.name.localeCompare(b.name);
    });
    return groups;
  }, [invoices, projectNameById, projects]);

  const activeProjectGroup = useMemo(
    () => projectGroups.find((g) => g.key === projectFilter) ?? null,
    [projectGroups, projectFilter]
  );

  const filteredInvoices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (projectFilter !== "all" && projectKeyForInvoice(inv) !== projectFilter) {
        return false;
      }
      if (statusFilter !== "all" && inv.status !== statusFilter) return false;
      if (dateFrom && inv.issueDate && inv.issueDate < dateFrom) return false;
      if (dateTo && inv.issueDate && inv.issueDate > dateTo) return false;
      if (!q) return true;
      const haystack = [
        inv.invoiceNumber,
        inv.clientName,
        inv.companyName,
        inv.clientEmail,
        inv.clientPhone,
        inv.projectTitle,
        inv.status,
        inv.projectId ? projectNameById.get(inv.projectId) : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [
    invoices,
    searchQuery,
    statusFilter,
    dateFrom,
    dateTo,
    projectFilter,
    projectNameById,
  ]);

  const filteredProjectGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filterActive =
      statusFilter !== "all" || Boolean(dateFrom) || Boolean(dateTo);

    return projectGroups
      .map((g) => {
        let list = g.invoices;
        if (statusFilter !== "all") {
          list = list.filter((inv) => inv.status === statusFilter);
        }
        if (dateFrom) {
          list = list.filter((inv) => inv.issueDate && inv.issueDate >= dateFrom);
        }
        if (dateTo) {
          list = list.filter((inv) => inv.issueDate && inv.issueDate <= dateTo);
        }
        return { ...g, invoices: list };
      })
      .filter((g) => {
        if (filterActive && g.invoices.length === 0) return false;
        if (!q) return true;
        const hay = [
          g.name,
          g.clientLabel,
          ...g.invoices.map((i) => i.invoiceNumber),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
  }, [projectGroups, searchQuery, statusFilter, dateFrom, dateTo]);

  const projectOverviewGroups = useMemo(() => {
    const q = dashboardQuery.trim().toLowerCase();

    return projectGroups
      .map((g) => {
        const sorted = [...g.invoices].sort((a, b) => {
          const rank = (s: BillingInvoiceStatus) =>
            s === "overdue" ? 0 : s === "sent" ? 1 : s === "draft" ? 2 : s === "paid" ? 3 : 4;
          const rd = rank(a.status) - rank(b.status);
          if (rd !== 0) return rd;
          return (b.issueDate || "").localeCompare(a.issueDate || "");
        });

        if (q) {
          const groupHit = [g.name, g.clientLabel].join(" ").toLowerCase().includes(q);
          if (!groupHit) {
            const matched = sorted.filter((inv) =>
              [inv.invoiceNumber, inv.clientName, inv.companyName, inv.status]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(q)
            );
            if (matched.length === 0) return null;
            return { ...g, displayInvoices: matched };
          }
        }
        return { ...g, displayInvoices: sorted };
      })
      .filter((g): g is ProjectInvoiceGroup & { displayInvoices: BillingInvoiceData[] } => {
        if (!g) return false;
        if (dashFilter === "outstanding") return g.openCount > 0;
        if (dashFilter === "fully_paid") {
          return g.paidCount > 0 && g.openCount === 0 && g.draftCount === 0;
        }
        if (dashFilter === "no_invoices") {
          return g.invoices.length === 0 && g.key !== "unlinked";
        }
        // all: real projects + any with invoices (hide empty unlinked)
        if (g.key === "unlinked" && g.invoices.length === 0) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.openCount !== b.openCount) return b.openCount - a.openCount;
        if (a.outstanding !== b.outstanding) return b.outstanding - a.outstanding;
        return b.paidTotal - a.paidTotal;
      });
  }, [projectGroups, dashboardQuery, dashFilter]);

  const overviewStats = useMemo(() => {
    let paidCount = 0;
    let paidTotal = 0;
    let openCount = 0;
    let outstanding = 0;
    let fullyPaidProjects = 0;
    let outstandingProjects = 0;
    for (const g of projectGroups) {
      if (g.key === "unlinked" && g.invoices.length === 0) continue;
      paidCount += g.paidCount;
      paidTotal += g.paidTotal;
      openCount += g.openCount;
      outstanding += g.outstanding;
      if (g.openCount > 0) outstandingProjects += 1;
      if (g.paidCount > 0 && g.openCount === 0 && g.draftCount === 0) fullyPaidProjects += 1;
    }
    return {
      paidCount,
      paidTotal: Math.round(paidTotal * 100) / 100,
      openCount,
      outstanding: Math.round(outstanding * 100) / 100,
      fullyPaidProjects,
      outstandingProjects,
      projectCount: projectGroups.filter(
        (g) => g.key !== "unlinked" || g.invoices.length > 0
      ).length,
    };
  }, [projectGroups]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    statusFilter !== "all" ||
    Boolean(dateFrom) ||
    Boolean(dateTo) ||
    projectFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setProjectFilter("all");
  };

  const focusProject = (key: string) => {
    setProjectFilter(key);
    setListMode("all");
    setExpandedProjectKey(key);
    setPanelMode("editor");
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/billing-invoices", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const list = (data.invoices || []) as BillingInvoiceData[];
        setInvoices(list);
        if (data.kpis) setKpis(data.kpis as InvoiceKpis);
        setForm((prev) => {
          if (prev.id) {
            const fresh = list.find((i) => i.id === prev.id);
            return fresh
              ? {
                  ...fresh,
                  lineItems: fresh.lineItems?.length
                    ? fresh.lineItems
                    : [{ description: "", quantity: 1, rate: 0 }],
                }
              : prev;
          }
          return {
            ...prev,
            invoiceNumber: nextInvoiceNumberFromExisting(list.map((i) => i.invoiceNumber)),
          };
        });
      }
    } catch {
      setMessage("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/projects", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const list = ((data.projects || []) as Array<Record<string, unknown>>).map((p) => ({
        id: String(p.id),
        projectName: String(p.projectName || ""),
        clientName: String(p.clientName || ""),
        clientEmail: String(p.clientEmail || ""),
        clientPhone: String(p.clientPhone || ""),
        companyName: String(p.companyName || ""),
      }));
      setProjects(list);
    } catch {
      /* ignore */
    }
  }, []);

  const loadEvents = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/admin/billing-invoices?id=${encodeURIComponent(id)}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      setEvents((data.events || []) as InvoiceEvent[]);
      if (data.kpis) setKpis(data.kpis as InvoiceKpis);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void load();
    void loadProjects();
  }, [load, loadProjects]);

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
    setForm(
      createDefaultBillingInvoice(invoices.map((i) => i.invoiceNumber))
    );
    setMessage("");
    setEvents([]);
    setSendConfirm(false);
  };

  const select = (inv: BillingInvoiceData) => {
    setForm({
      ...inv,
      lineItems: inv.lineItems?.length
        ? inv.lineItems
        : [{ description: "", quantity: 1, rate: 0 }],
    });
    setMessage("");
    setSendConfirm(false);
    if (inv.id) void loadEvents(inv.id);
    else setEvents([]);
  };

  const openInvoice = (inv: BillingInvoiceData) => {
    select(inv);
    setPanelMode("editor");
  };

  const openNewInvoice = () => {
    reset();
    setProjectFilter("all");
    setPanelMode("editor");
  };

  /** New draft invoice with the same client / project / lines as the current form. */
  const duplicateInvoice = () => {
    const today = new Date();
    const due = new Date(today);
    due.setDate(due.getDate() + 15);
    const nums = invoices.map((i) => i.invoiceNumber);
    if (form.invoiceNumber) nums.push(form.invoiceNumber);

    const lineItems =
      form.lineItems?.length > 0
        ? form.lineItems.map((li) => ({
            description: li.description,
            quantity: li.quantity,
            rate: li.rate,
          }))
        : [{ description: "", quantity: 1, rate: 0 }];

    setForm({
      ...createDefaultBillingInvoice(nums),
      issueDate: today.toISOString().split("T")[0],
      dueDate: due.toISOString().split("T")[0],
      clientName: form.clientName,
      companyName: form.companyName,
      clientEmail: form.clientEmail,
      clientPhone: form.clientPhone,
      clientAddress: form.clientAddress,
      projectTitle: form.projectTitle,
      projectId: form.projectId || null,
      lineItems,
      discountPercent: form.discountPercent,
      hstPercent: form.hstPercent,
      paymentMethod: form.paymentMethod || "E-Transfer",
      paymentTerms: form.paymentTerms,
      notes: form.notes,
      // fresh invoice — not paid / not linked to old payment / checkout
      amountPaid: 0,
      status: "draft",
      projectPaymentId: null,
      checkoutUrl: "",
      paidAt: "",
      sentAt: "",
      sentTo: "",
      lastSendError: "",
    });
    setEvents([]);
    setSendConfirm(false);
    setShowMoreActions(false);
    setPanelMode("editor");
    setMessage(
      `Duplicated as draft ${nextInvoiceNumberFromExisting(nums)} — review and Save`
    );
  };

  const createForProject = (projectId: string | null, projectName?: string) => {
    const nums = invoices.map((i) => i.invoiceNumber);
    const base = createDefaultBillingInvoice(nums);
    if (projectId) {
      const p = projects.find((x) => x.id === projectId);
      if (p) {
        setForm({
          ...base,
          projectId: p.id,
          projectTitle: p.projectName,
          clientName: p.clientName || "",
          clientEmail: p.clientEmail || "",
          clientPhone: p.clientPhone || "",
          companyName: p.companyName || "",
        });
      } else {
        setForm({
          ...base,
          projectId,
          projectTitle: projectName || "",
        });
      }
    } else {
      setForm({
        ...base,
        projectTitle: projectName || "",
      });
    }
    setMessage("");
    setEvents([]);
    setSendConfirm(false);
    setProjectFilter(projectId ? `id:${projectId}` : "all");
    setPanelMode("editor");
  };

  useEffect(() => {
    try {
      const openId = sessionStorage.getItem("vyntech-open-billing-invoice");
      if (!openId || invoices.length === 0) return;
      const inv = invoices.find((i) => i.id === openId);
      if (inv) {
        openInvoice(inv);
        sessionStorage.removeItem("vyntech-open-billing-invoice");
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once when list arrives
  }, [invoices]);

  const applyProject = (projectId: string) => {
    set("projectId", projectId || null);
    if (!projectId) return;
    const p = projects.find((x) => x.id === projectId);
    if (!p) return;
    setForm((prev) => ({
      ...prev,
      projectId: p.id,
      projectTitle: p.projectName,
      clientName: prev.clientName.trim() ? prev.clientName : p.clientName,
      clientEmail: prev.clientEmail.trim() ? prev.clientEmail : p.clientEmail,
      clientPhone: prev.clientPhone.trim() ? prev.clientPhone : p.clientPhone,
      companyName: prev.companyName.trim() ? prev.companyName : p.companyName,
    }));
  };

  const createPayLink = async () => {
    const saved = form.id ? form : await save();
    if (!saved?.id) {
      setMessage("Save the invoice first");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/billing-invoices/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: saved.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not create pay link");
      if (data.invoice) setForm(data.invoice);
      if (data.checkoutUrl) {
        try {
          await navigator.clipboard.writeText(String(data.checkoutUrl));
          setMessage("Pay link created and copied");
        } catch {
          setMessage(String(data.checkoutUrl));
        }
      } else {
        setMessage("Pay link ready");
      }
      await load();
      if (saved.id) void loadEvents(saved.id);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Pay link failed");
    } finally {
      setBusy(false);
    }
  };

  const sendInvoice = async (kind: "client" | "test") => {
    const saved = form.id ? form : await save();
    if (!saved?.id) return;
    if (kind === "client" && !sendConfirm) {
      setSendConfirm(true);
      setMessage(`Confirm send to ${saved.clientEmail || "client"}? Click Send again.`);
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/billing-invoices/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: saved.id, kind }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Send failed");
      if (data.invoice) setForm(data.invoice);
      setSendConfirm(false);
      setMessage(
        kind === "test"
          ? `Test invoice emailed to ${data.sentTo || "admin"}`
          : `Invoice emailed to ${data.sentTo || saved.clientEmail}`
      );
      await load();
      void loadEvents(saved.id);
    } catch (e) {
      setSendConfirm(false);
      setMessage(e instanceof Error ? e.message : "Send failed");
    } finally {
      setBusy(false);
    }
  };

  const recordPayment = async () => {
    if (!form.id) {
      setMessage("Save first");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/billing-invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_payment",
          id: form.id,
          amountPaid: totals.total,
          paymentMethod: form.paymentMethod || "E-Transfer",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not record payment");
      if (data.invoice) setForm(data.invoice);
      setMessage("Payment recorded — invoice marked paid");
      await load();
      void loadEvents(form.id);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Record payment failed");
    } finally {
      setBusy(false);
    }
  };

  const save = async (
    override?: Partial<BillingInvoiceData>
  ): Promise<BillingInvoiceData | null> => {
    const payload = { ...form, ...override };
    if (!payload.clientName.trim()) {
      setMessage("Client name is required");
      return null;
    }
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/billing-invoices", {
        method: payload.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setForm(data.invoice);
      setMessage(
        override?.status === "cancelled" ? "Invoice cancelled" : "Invoice saved"
      );
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
    <div className="admin-client-invoices flex flex-col xl:flex-row gap-6 min-h-[calc(100vh-8rem)]">
      <div className={`${sidebarOpen ? "xl:w-64" : "xl:w-56"} shrink-0 space-y-4`}>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
          <div className="p-3 border-b border-white/10 flex items-center justify-between gap-2">
            <h3 className="text-white font-semibold text-sm shrink-0">Invoices</h3>
            <button
              onClick={openNewInvoice}
              className="text-xs px-2 py-1 bg-[#0055FF] text-white rounded-md shrink-0"
            >
              + New
            </button>
          </div>

          <div className="px-3 pt-2 flex gap-1 border-b border-white/10 pb-2">
            <button
              type="button"
              onClick={() => setListMode("all")}
              className={`ci-tab flex-1 text-[11px] py-1.5 rounded-md font-medium border ${
                listMode === "all" ? "ci-tab--active" : "border-transparent"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setListMode("by_project")}
              className={`ci-tab flex-1 text-[11px] py-1.5 rounded-md font-medium border ${
                listMode === "by_project" ? "ci-tab--active" : "border-transparent"
              }`}
            >
              By project
            </button>
          </div>

          <div className="p-3 border-b border-white/10 space-y-2">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                listMode === "by_project"
                  ? "Search project, client, #…"
                  : "Search #, client, project…"
              }
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder-white/30 outline-none focus:border-[#00B4FF]/50"
            />
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className="ci-link text-[11px]"
              >
                {showFilters ? "Hide filters" : "Advanced filters"}
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[11px] text-white/50 hover:text-white/80"
                >
                  Clear
                </button>
              )}
            </div>
            {showFilters && (
              <div className="space-y-2 pt-1">
                <div>
                  <label className="block text-white/40 text-[10px] mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as "all" | BillingInvoiceStatus)
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-[#00B4FF]/50"
                  >
                    <option value="all" className="bg-[#0a0a1a]">
                      All statuses
                    </option>
                    {BILLING_STATUSES.map((s) => (
                      <option key={s.value} value={s.value} className="bg-[#0a0a1a]">
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white/40 text-[10px] mb-1">Project</label>
                  <select
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-[#00B4FF]/50"
                  >
                    <option value="all" className="bg-[#0a0a1a]">
                      All projects
                    </option>
                    {projectGroups.map((g) => (
                      <option key={g.key} value={g.key} className="bg-[#0a0a1a]">
                        {g.name}
                        {g.paidCount > 0 ? ` · ${g.paidCount} paid` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-white/40 text-[10px] mb-1">From</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-[#00B4FF]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-white/40 text-[10px] mb-1">To</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-[#00B4FF]/50"
                    />
                  </div>
                </div>
              </div>
            )}
            <p className="text-white/35 text-[10px]">
              {loading
                ? "…"
                : listMode === "by_project"
                  ? `${filteredProjectGroups.length} project${
                      filteredProjectGroups.length === 1 ? "" : "s"
                    } · ${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`
                  : `${filteredInvoices.length} of ${invoices.length} invoice${
                      invoices.length === 1 ? "" : "s"
                    }`}
            </p>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <p className="p-3 text-white/40 text-sm">Loading...</p>
            ) : listMode === "by_project" ? (
              filteredProjectGroups.length === 0 ? (
                <p className="p-3 text-white/40 text-sm">
                  {projects.length === 0 && invoices.length === 0
                    ? "No projects or invoices yet"
                    : "No projects match your filters"}
                </p>
              ) : (
                filteredProjectGroups.map((g) => {
                  const expanded = expandedProjectKey === g.key;
                  return (
                    <div key={g.key} className="border-b border-white/5">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedProjectKey(expanded ? null : g.key)
                        }
                        className="w-full text-left p-3 hover:bg-white/5"
                      >
                        <p className="text-white text-sm font-medium truncate">{g.name}</p>
                        {g.clientLabel ? (
                          <p className="text-white/40 text-[11px] truncate">{g.clientLabel}</p>
                        ) : null}
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {g.paidCount > 0 ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                              {g.paidCount} paid
                            </span>
                          ) : null}
                          {g.openCount > 0 ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">
                              {g.openCount} open
                            </span>
                          ) : null}
                          {g.draftCount > 0 ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/50">
                              {g.draftCount} draft
                            </span>
                          ) : null}
                          {g.invoices.length === 0 ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/35">
                              No invoices
                            </span>
                          ) : (
                            <span className="text-[10px] text-white/35 ml-auto tabular-nums">
                              {g.invoices.length} inv.
                            </span>
                          )}
                        </div>
                      </button>
                      {expanded ? (
                        <div className="pb-1 bg-white/[0.02]">
                          {g.invoices.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => focusProject(g.key)}
                              className="ci-link mx-3 mb-2 text-[10px]"
                            >
                              Filter editor list to this project →
                            </button>
                          ) : null}
                          {g.invoices.length === 0 ? (
                            <div className="px-3 py-2 space-y-2">
                              <p className="text-white/40 text-xs">
                                No invoices linked yet.
                              </p>
                              {g.projectId || g.key.startsWith("title:") ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    createForProject(
                                      g.projectId,
                                      g.name === "No project linked" ? "" : g.name
                                    )
                                  }
                                  className="pm-action-btn text-[11px]"
                                >
                                  + Create for this project
                                </button>
                              ) : null}
                            </div>
                          ) : null}
                          {g.invoices.map((inv) => {
                            const invTotal = calculateBillingTotals(inv).total;
                            return (
                              <button
                                key={inv.id}
                                type="button"
                                onClick={() => openInvoice(inv)}
                                className={`w-full text-left px-3 py-2 pl-5 border-t border-white/5 hover:bg-white/5 ${
                                  form.id === inv.id && panelMode === "editor"
                                    ? "ci-invoice-row--selected"
                                    : ""
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-white/80 text-xs truncate">
                                    {inv.invoiceNumber}
                                  </span>
                                  <span
                                    className={`text-[10px] uppercase shrink-0 px-1 py-0.5 rounded ${
                                      STATUS_COLORS[inv.status] || STATUS_COLORS.draft
                                    }`}
                                  >
                                    {inv.status}
                                  </span>
                                </div>
                                <p className="text-[10px] text-white/40 tabular-nums mt-0.5">
                                  {formatCad(invTotal)}
                                  {inv.status === "paid" && inv.paidAt
                                    ? ` · paid ${inv.paidAt.slice(0, 10)}`
                                    : ""}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )
            ) : invoices.length === 0 ? (
              <p className="p-3 text-white/40 text-sm">No client invoices yet</p>
            ) : filteredInvoices.length === 0 ? (
              <p className="p-3 text-white/40 text-sm">No invoices match your search</p>
            ) : (
              filteredInvoices.map((inv) => {
                const projectLabel =
                  (inv.projectId && projectNameById.get(inv.projectId)) ||
                  inv.projectTitle?.trim() ||
                  "";
                return (
                  <button
                    key={inv.id}
                    onClick={() => openInvoice(inv)}
                    className={`w-full text-left p-3 border-b border-white/5 hover:bg-white/5 ${
                      form.id === inv.id && panelMode === "editor"
                        ? "ci-invoice-row--selected"
                        : ""
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
                    {projectLabel ? (
                      <p className="ci-project-link text-[11px] truncate">{projectLabel}</p>
                    ) : null}
                    {inv.companyName ? (
                      <p className="text-white/30 text-[11px] truncate">{inv.companyName}</p>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {panelMode === "editor" ? (
          <div className="ci-sidebar-totals rounded-xl p-4 text-sm space-y-2">
            <div className="ci-sidebar-totals__line flex justify-between">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCad(totals.subtotal)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="ci-sidebar-totals__line flex justify-between">
                <span>Discount</span>
                <span className="tabular-nums">-{formatCad(totals.discount)}</span>
              </div>
            )}
            <div className="ci-sidebar-totals__line flex justify-between">
              <span>HST</span>
              <span className="tabular-nums">{formatCad(totals.hst)}</span>
            </div>
            <div className="ci-sidebar-totals__total-row flex justify-between border-t pt-2 mt-1">
              <span>Total</span>
              <span className="ci-sidebar-totals__total tabular-nums">{formatCad(totals.total)}</span>
            </div>
            <div className="ci-sidebar-totals__line flex justify-between">
              <span>Balance</span>
              <span className="tabular-nums">{formatCad(totals.balance)}</span>
            </div>
          </div>
        ) : (
          <div className="ci-sidebar-totals rounded-xl p-4 text-sm space-y-2">
            <p className="text-[10px] uppercase tracking-wide text-white/45">
              Project payments
            </p>
            <div className="ci-sidebar-totals__line flex justify-between">
              <span>Outstanding</span>
              <span className="tabular-nums text-sky-300">
                {formatCad(overviewStats.outstanding)}
              </span>
            </div>
            <div className="ci-sidebar-totals__line flex justify-between">
              <span>Open invoices</span>
              <span className="tabular-nums">{overviewStats.openCount}</span>
            </div>
            <div className="ci-sidebar-totals__line flex justify-between">
              <span>Paid invoices</span>
              <span className="tabular-nums">{overviewStats.paidCount}</span>
            </div>
            <div className="ci-sidebar-totals__total-row flex justify-between border-t pt-2 mt-1">
              <span>Collected</span>
              <span className="ci-sidebar-totals__total tabular-nums">
                {formatCad(overviewStats.paidTotal)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex gap-1 p-0.5 rounded-lg border border-white/10 bg-white/[0.03]">
            <button
              type="button"
              onClick={() => setPanelMode("editor")}
              className={`ci-tab px-3 py-1.5 text-xs font-medium rounded-md border ${
                panelMode === "editor" ? "ci-tab--active" : "border-transparent"
              }`}
            >
              Invoice editor
            </button>
            <button
              type="button"
              onClick={() => setPanelMode("dashboard")}
              className={`ci-tab px-3 py-1.5 text-xs font-medium rounded-md border ${
                panelMode === "dashboard" ? "ci-tab--active" : "border-transparent"
              }`}
            >
              Project payments
            </button>
          </div>
          {panelMode === "dashboard" ? (
            <button
              type="button"
              onClick={openNewInvoice}
              className="px-3 py-1.5 bg-[#0055FF] hover:bg-[#0044CC] text-white text-xs rounded-md font-medium ml-auto"
            >
              + New invoice
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setPanelMode("dashboard")}
              className="pm-action-btn text-xs ml-auto"
            >
              Project payments overview →
            </button>
          )}
        </div>

        {panelMode === "dashboard" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  {
                    label: "Outstanding due",
                    value: formatCad(overviewStats.outstanding),
                    hint: `${overviewStats.outstandingProjects} project${overviewStats.outstandingProjects === 1 ? "" : "s"}`,
                  },
                  {
                    label: "Open invoices",
                    value: String(overviewStats.openCount),
                    hint: "Sent / overdue",
                  },
                  {
                    label: "Collected",
                    value: formatCad(overviewStats.paidTotal),
                    hint: `${overviewStats.paidCount} paid`,
                  },
                  {
                    label: "Fully paid projects",
                    value: String(overviewStats.fullyPaidProjects),
                    hint: "No open balance",
                  },
                ] as const
              ).map((k) => (
                <div
                  key={k.label}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
                >
                  <p className="text-[10px] uppercase tracking-wide text-white/40">{k.label}</p>
                  <p className="text-sm font-semibold text-white mt-0.5 tabular-nums">{k.value}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">{k.hint}</p>
                </div>
              ))}
            </div>

            <div className="ci-paid-dash rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <div className="p-4 border-b border-white/10 space-y-3">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-semibold text-base">
                      Payments by project
                    </h3>
                    <p className="text-white/45 text-xs mt-0.5">
                      See which projects are paid, still due, or have no invoice yet
                    </p>
                  </div>
                  <input
                    type="search"
                    value={dashboardQuery}
                    onChange={(e) => setDashboardQuery(e.target.value)}
                    placeholder="Filter project, client, invoice #…"
                    className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder-white/30 outline-none focus:border-[#00B4FF]/50"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {(
                    [
                      { id: "all", label: "All projects" },
                      { id: "outstanding", label: "Outstanding" },
                      { id: "fully_paid", label: "Fully paid" },
                      { id: "no_invoices", label: "No invoices" },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setDashFilter(f.id)}
                      className={`ci-tab px-2.5 py-1 text-[11px] font-medium rounded-md border ${
                        dashFilter === f.id ? "ci-tab--active" : "border-transparent"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <p className="p-6 text-white/40 text-sm">Loading project payments…</p>
              ) : projectOverviewGroups.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <p className="text-white/70 text-sm font-medium">
                    {dashboardQuery.trim() || dashFilter !== "all"
                      ? "No projects match this filter"
                      : "No projects yet"}
                  </p>
                  <p className="text-white/40 text-xs max-w-md mx-auto">
                    Link invoices to projects (or create from Project Manager milestones) to
                    track paid vs outstanding per project.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {projectOverviewGroups.map((g) => {
                    const expanded = expandedDashKey === g.key;
                    const paidShare =
                      g.paidCount + g.openCount + g.draftCount > 0
                        ? Math.round(
                            (g.paidCount / (g.paidCount + g.openCount + g.draftCount)) * 100
                          )
                        : 0;
                    return (
                      <div key={g.key} className="ci-paid-project">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedDashKey(expanded ? null : g.key)
                          }
                          className="w-full text-left px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2 bg-white/[0.02] hover:bg-white/[0.04]"
                        >
                          <div className="min-w-0">
                            <p className="text-white font-semibold text-sm truncate">{g.name}</p>
                            {g.clientLabel ? (
                              <p className="text-white/45 text-xs truncate">{g.clientLabel}</p>
                            ) : null}
                            {g.invoices.length > 0 ? (
                              <div className="mt-1.5 h-1.5 w-36 max-w-full rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-emerald-500/80"
                                  style={{ width: `${paidShare}%` }}
                                />
                              </div>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap gap-2 text-[11px] ml-auto items-center">
                            {g.paidCount > 0 ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-medium tabular-nums">
                                {g.paidCount} paid · {formatCad(g.paidTotal)}
                              </span>
                            ) : null}
                            {g.openCount > 0 ? (
                              <span className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 tabular-nums">
                                {g.openCount} open · {formatCad(g.outstanding)} due
                              </span>
                            ) : g.invoices.length > 0 ? (
                              <span className="px-2 py-0.5 rounded bg-white/5 text-white/45">
                                No open balance
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-200">
                                No invoices
                              </span>
                            )}
                            <span className="text-white/35 text-[10px]">
                              {expanded ? "Hide ▲" : "Show ▼"}
                            </span>
                          </div>
                        </button>
                        {expanded ? (
                          <div className="pb-2">
                            <div className="px-4 py-2 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => focusProject(g.key)}
                                className="ci-link text-[11px]"
                              >
                                Filter editor to this project →
                              </button>
                              {(g.projectId || g.key.startsWith("title:")) && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    createForProject(
                                      g.projectId,
                                      g.name === "No project linked" ? "" : g.name
                                    )
                                  }
                                  className="pm-action-btn text-[11px]"
                                >
                                  + New for this project
                                </button>
                              )}
                            </div>
                            {g.displayInvoices.length === 0 ? (
                              <p className="px-4 py-3 text-white/40 text-xs">
                                No invoices yet for this project.
                              </p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs min-w-[560px]">
                                  <thead>
                                    <tr className="text-white/40 border-b border-white/5">
                                      <th className="px-4 py-2 font-medium">Invoice</th>
                                      <th className="px-3 py-2 font-medium">Status</th>
                                      <th className="px-3 py-2 font-medium">Client</th>
                                      <th className="px-3 py-2 font-medium">Date</th>
                                      <th className="px-4 py-2 font-medium text-right">
                                        Amount
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {g.displayInvoices.map((inv) => {
                                      const amount = calculateBillingTotals(inv).total;
                                      const dateLabel =
                                        inv.status === "paid" && inv.paidAt
                                          ? `Paid ${inv.paidAt.slice(0, 10)}`
                                          : inv.dueDate
                                            ? `Due ${inv.dueDate}`
                                            : inv.issueDate || "—";
                                      return (
                                        <tr
                                          key={inv.id}
                                          className="border-b border-white/5 hover:bg-white/[0.04] cursor-pointer"
                                          onClick={() => openInvoice(inv)}
                                        >
                                          <td className="px-4 py-2.5 text-white font-medium">
                                            {inv.invoiceNumber}
                                          </td>
                                          <td className="px-3 py-2.5">
                                            <span
                                              className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${
                                                STATUS_COLORS[inv.status] ||
                                                STATUS_COLORS.draft
                                              }`}
                                            >
                                              {inv.status}
                                            </span>
                                          </td>
                                          <td className="px-3 py-2.5 text-white/70 truncate max-w-[160px]">
                                            {inv.clientName}
                                          </td>
                                          <td className="px-3 py-2.5 text-white/55 tabular-nums">
                                            {dateLabel}
                                          </td>
                                          <td className="px-4 py-2.5 text-right text-white font-semibold tabular-nums">
                                            {formatCad(amount)}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {panelMode === "editor" ? (
          <>
        {activeProjectGroup ? (
          <div className="ci-project-banner rounded-xl px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-white/45">Project</p>
              <p className="text-white font-semibold">{activeProjectGroup.name}</p>
              {activeProjectGroup.clientLabel ? (
                <p className="text-white/50 text-xs">{activeProjectGroup.clientLabel}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="text-emerald-300">
                {activeProjectGroup.paidCount} paid · {formatCad(activeProjectGroup.paidTotal)}
              </span>
              {activeProjectGroup.openCount > 0 ? (
                <span className="text-sky-300">
                  {activeProjectGroup.openCount} open ·{" "}
                  {formatCad(activeProjectGroup.outstanding)} due
                </span>
              ) : (
                <span className="text-white/45">No open invoices</span>
              )}
              {activeProjectGroup.draftCount > 0 ? (
                <span className="text-white/50">{activeProjectGroup.draftCount} draft</span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setProjectFilter("all")}
              className="pm-action-btn text-xs ml-auto"
            >
              Clear project filter
            </button>
          </div>
        ) : null}

        {kpis ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(
              [
                { label: "Draft", value: String(kpis.draft) },
                { label: "Sent", value: String(kpis.sent) },
                { label: "Overdue", value: String(kpis.overdue) },
                { label: "Paid (month)", value: String(kpis.paidMonth) },
                { label: "Outstanding", value: formatCad(kpis.outstanding) },
              ] as const
            ).map((k) => (
              <div
                key={k.label}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
              >
                <p className="text-[10px] uppercase tracking-wide text-white/40">{k.label}</p>
                <p className="text-sm font-semibold text-white mt-0.5 tabular-nums">{k.value}</p>
              </div>
            ))}
          </div>
        ) : null}

        {message && (
          <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80">
            {message}
          </div>
        )}

        <div className="ci-toolbar sticky top-0 z-10 py-2 -mx-0.5 px-0.5 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[11px] uppercase tracking-wide px-2 py-1 rounded font-semibold ${
                STATUS_COLORS[form.status] || STATUS_COLORS.draft
              }`}
            >
              {form.status}
            </span>
            <p className="text-xs text-white/55 min-w-0 flex-1">{nextStepHint}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => save()}
              disabled={saving}
              className="px-4 py-2 bg-[#0055FF] hover:bg-[#0044CC] text-white text-sm rounded-md font-medium disabled:opacity-50"
            >
              {saving ? "Saving..." : "1. Save"}
            </button>
            <button
              onClick={() => void sendInvoice("client")}
              disabled={busy || form.status === "cancelled" || form.status === "paid"}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-md font-medium disabled:opacity-50"
            >
              {sendConfirm ? "Confirm send →" : "2. Send to client"}
            </button>
            <button
              type="button"
              onClick={duplicateInvoice}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm rounded-md font-medium"
              title="Create a new draft with the same client, project, and line items"
            >
              Duplicate
            </button>
            {form.id &&
            (form.status === "sent" || form.status === "overdue") ? (
              <button
                onClick={() => void recordPayment()}
                disabled={busy}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm rounded-md font-medium disabled:opacity-50"
              >
                3. Record paid
              </button>
            ) : null}

            <div className="relative ml-auto">
              <button
                type="button"
                onClick={() => setShowMoreActions((v) => !v)}
                className="pm-action-btn px-3 py-1.5 text-sm"
              >
                More {showMoreActions ? "▲" : "▼"}
              </button>
              {showMoreActions ? (
                <div className="ci-more-menu absolute right-0 mt-1 z-20 min-w-[180px] rounded-lg border border-white/10 bg-[#0a0a1a] shadow-lg p-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreActions(false);
                      void downloadPdf();
                    }}
                    disabled={busy}
                    className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/5 rounded-md disabled:opacity-50"
                  >
                    Download PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreActions(false);
                      void sendInvoice("test");
                    }}
                    disabled={busy}
                    className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/5 rounded-md disabled:opacity-50"
                  >
                    Send test email
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreActions(false);
                      void createPayLink();
                    }}
                    disabled={busy || form.status === "cancelled" || form.status === "paid"}
                    className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/5 rounded-md disabled:opacity-50"
                  >
                    Get pay link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreActions(false);
                      copyVerifyLink();
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/5 rounded-md"
                  >
                    Copy verify link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreActions(false);
                      set(
                        "invoiceNumber",
                        nextInvoiceNumberFromExisting(invoices.map((i) => i.invoiceNumber))
                      );
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/5 rounded-md"
                  >
                    Next invoice #
                  </button>
                  {form.id && form.status !== "cancelled" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMoreActions(false);
                        if (!confirm("Cancel this invoice? Client should not pay it.")) return;
                        void save({ status: "cancelled" });
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-amber-300 hover:bg-white/5 rounded-md"
                    >
                      Mark cancelled
                    </button>
                  ) : null}
                  {form.id ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMoreActions(false);
                        void remove();
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-300 hover:bg-white/5 rounded-md"
                    >
                      Delete invoice
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className={card}>
          <h4 className="text-white font-semibold text-sm">Invoice Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className={label}>Invoice Number</label>
              <input className={input} value={form.invoiceNumber} onChange={(e) => set("invoiceNumber", e.target.value)} />
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
          <p className="text-[11px] text-white/40 pt-1">
            Status updates automatically: Save → Draft · Send to client → Sent · Payment → Paid.
            You do not need to change it manually.
          </p>
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
            <div>
              <label className={label}>Link project</label>
              <select
                className={input}
                value={form.projectId || ""}
                onChange={(e) => applyProject(e.target.value)}
              >
                <option value="" className="bg-[#0a0a1a]">
                  No project
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0a0a1a]">
                    {p.projectName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Project / Service Title</label>
              <input className={input} value={form.projectTitle} placeholder="Website Redesign — Phase 1" onChange={(e) => set("projectTitle", e.target.value)} />
            </div>
            {form.checkoutUrl ? (
              <div className="md:col-span-2">
                <label className={label}>Pay link</label>
                <p className="text-[11px] text-[#7dd3fc] break-all">{form.checkoutUrl}</p>
              </div>
            ) : null}
          </div>
        </div>

        {events.length > 0 ? (
          <div className={card}>
            <h4 className="text-white font-semibold text-sm">Activity</h4>
            <ul className="space-y-1.5 max-h-36 overflow-y-auto">
              {events.map((e) => (
                <li key={e.id} className="text-[11px] text-white/55 flex justify-between gap-2">
                  <span className="capitalize">{e.type.replace(/_/g, " ")}</span>
                  <span className="text-white/30 shrink-0">
                    {new Date(e.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

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
          </>
        ) : null}
      </div>
    </div>
  );
}
