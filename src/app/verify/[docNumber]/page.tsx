"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type VerifyPayload = {
  verified: boolean;
  issuedBy: string;
  company: string;
  document: {
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

  const doc = data.document;
  const isSalary = doc.expenseType === "salary";

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

          <div className="px-6 py-5 space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Document type</p>
              <p className="text-slate-900 font-medium">{isSalary ? "Salary Slip" : "Expense Voucher"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Document #</p>
                <p className="text-slate-900 font-medium text-sm break-all">{doc.documentNumber}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Issue date</p>
                <p className="text-slate-900 font-medium text-sm">{fmtDate(doc.issueDate)}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                {isSalary ? "Employee" : "Payee"}
              </p>
              <p className="text-slate-900 font-medium">{doc.payeeName}</p>
              {doc.payeeRole ? <p className="text-slate-500 text-sm">{doc.payeeRole}</p> : null}
            </div>

            {isSalary && doc.periodLabel ? (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Pay period</p>
                <p className="text-slate-900 font-medium">{doc.periodLabel}</p>
              </div>
            ) : doc.category ? (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Category</p>
                <p className="text-slate-900 font-medium">{doc.category}</p>
              </div>
            ) : null}

            <div className="rounded-xl bg-[#0F2A5F]/5 border border-[#0F2A5F]/10 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-slate-600">{doc.amountLabel}</span>
              <span className="text-lg font-bold text-[#0F2A5F]">{doc.amount}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Issued by</p>
                <p className="text-slate-900 font-medium text-sm">{data.issuedBy}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Company</p>
                <p className="text-slate-900 font-medium text-sm">{data.company}</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          If this does not match the paper/PDF you received, contact{" "}
          <a href="mailto:info@vyntechsolutions.ca" className="text-[#0055FF]">
            info@vyntechsolutions.ca
          </a>
        </p>
      </div>
    </div>
  );
}
