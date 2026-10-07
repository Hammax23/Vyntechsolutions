"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type ExpenseDoc = {
  expenseType: "salary" | "expense";
  documentNumber: string;
  issueDate: string;
  payeeName: string;
  payeeRole: string;
  periodLabel: string;
  category: string;
  paymentMethod: string;
  status: string;
  amountLabel: string;
  amount: string;
  createdAt: string;
};

type BillingDoc = {
  documentNumber: string;
  issueDate: string;
  dueDate: string;
  clientName: string;
  companyName: string;
  projectTitle: string;
  paymentMethod: string;
  status: string;
  amountLabel: string;
  amount: string;
  balance: string;
  balanceValue?: number;
  checkoutUrl?: string;
  lineItems?: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: string;
  }>;
  createdAt: string;
};

type VerifyPayload = {
  verified: boolean;
  issuedBy: string;
  company: string;
  documentType?: string;
  document: ExpenseDoc | BillingDoc;
};

function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function VerifyDocumentPage({ params }: { params: { docNumber: string } }) {
  const [data, setData] = useState<VerifyPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/verify/${encodeURIComponent(params.docNumber)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Not found");
      setData(json);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }, [params.docNumber]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-500 text-sm">
        Verifying document...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="max-w-lg mx-auto bg-white border border-red-100 rounded-2xl p-8 text-center shadow-sm">
          <p className="text-xs uppercase tracking-wider text-red-500 font-semibold mb-2">Not verified</p>
          <h1 className="text-xl font-bold text-slate-900 mb-3">Document not found</h1>
          <p className="text-sm text-slate-600 mb-6">
            {error || "This verification code is not issued by VynTech Solutions."}
          </p>
          <p className="text-xs text-slate-400 mb-6 break-all">Ref: {decodeURIComponent(params.docNumber)}</p>
          <Link href="/" className="text-sm text-[#0055FF] hover:underline">
            Back to vyntechsolutions.ca
          </Link>
        </div>
      </div>
    );
  }

  const isBilling = data.documentType === "client_invoice";
  const billing = isBilling ? (data.document as BillingDoc) : null;
  const expense = !isBilling ? (data.document as ExpenseDoc) : null;
  const isSalary = expense?.expenseType === "salary";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <Image src="/logo-print.png" alt="VynTech" width={40} height={40} className="w-10 h-10 object-contain" />
          <div>
            <p className="text-sm font-bold text-[#0F2A5F] tracking-wide">VYNTECH SOLUTIONS</p>
            <p className="text-xs text-slate-500">Document verification</p>
          </div>
        </div>

        <div className="bg-white border border-emerald-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4 flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white text-sm font-bold">
              ✓
            </span>
            <div>
              <p className="text-emerald-800 font-semibold text-sm">Verified authentic document</p>
              <p className="text-emerald-700/80 text-xs">Issued from VynTech admin system, not a personal copy</p>
            </div>
          </div>

          {billing ? (
            <div className="px-6 py-5 space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Document type</p>
                <p className="text-slate-900 font-medium">Client Invoice</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Invoice #</p>
                  <p className="text-slate-900 font-medium break-all">{billing.documentNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Status</p>
                  <p className="text-slate-900 font-medium capitalize">{billing.status}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Issue date</p>
                  <p className="text-slate-900 font-medium">{fmtDate(billing.issueDate)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Due date</p>
                  <p className="text-slate-900 font-medium">{fmtDate(billing.dueDate)}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Bill to</p>
                <p className="text-slate-900 font-medium">{billing.clientName}</p>
                {billing.companyName ? (
                  <p className="text-slate-600 text-sm">{billing.companyName}</p>
                ) : null}
              </div>
              {billing.projectTitle ? (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Project</p>
                  <p className="text-slate-900 font-medium">{billing.projectTitle}</p>
                </div>
              ) : null}
              {billing.lineItems && billing.lineItems.length > 0 ? (
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <div className="px-3 py-2 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    Line items
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {billing.lineItems.map((line, i) => (
                      <li key={i} className="px-3 py-2 flex justify-between gap-3 text-sm">
                        <span className="text-slate-700 min-w-0 truncate">{line.description}</span>
                        <span className="text-slate-900 font-medium shrink-0">{line.amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total</p>
                  <p className="text-slate-900 font-bold text-lg">{billing.amount}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Balance due</p>
                  <p className="text-slate-900 font-bold text-lg">{billing.balance}</p>
                </div>
              </div>
              {billing.checkoutUrl && (billing.balanceValue == null || billing.balanceValue > 0) && billing.status !== "paid" ? (
                <a
                  href={billing.checkoutUrl}
                  className="inline-flex w-full justify-center rounded-lg bg-[#0055FF] text-white text-sm font-semibold px-4 py-2.5 hover:bg-[#0044CC]"
                >
                  Pay now
                </a>
              ) : null}
            </div>
          ) : expense ? (
            <div className="px-6 py-5 space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Document type</p>
                <p className="text-slate-900 font-medium">{isSalary ? "Salary Slip" : "Expense Voucher"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Document #</p>
                  <p className="text-slate-900 font-medium break-all">{expense.documentNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Issue date</p>
                  <p className="text-slate-900 font-medium">{fmtDate(expense.issueDate)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Payee</p>
                  <p className="text-slate-900 font-medium">{expense.payeeName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{expense.amountLabel}</p>
                  <p className="text-slate-900 font-bold text-lg">{expense.amount}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Issued by {data.company} · {data.issuedBy}
        </p>
      </div>
    </div>
  );
}
