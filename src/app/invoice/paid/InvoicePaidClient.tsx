"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export default function InvoicePaidClient() {
  const params = useSearchParams();
  const sessionId = params.get("session_id") || "";
  const [status, setStatus] = useState<"loading" | "ok" | "pending">("loading");

  useEffect(() => {
    const t = window.setTimeout(() => setStatus(sessionId ? "ok" : "pending"), 400);
    return () => window.clearTimeout(t);
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="max-w-lg mx-auto bg-white border border-emerald-100 rounded-2xl p-8 text-center shadow-sm">
        <div className="flex justify-center mb-4">
          <Image src="/logo-print.png" alt="VynTech" width={48} height={48} className="w-12 h-12 object-contain" />
        </div>
        <p className="text-xs uppercase tracking-wider text-emerald-600 font-semibold mb-2">
          {status === "loading" ? "Confirming…" : "Payment received"}
        </p>
        <h1 className="text-xl font-bold text-slate-900 mb-3">Thank you</h1>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Your payment to VynTech Solutions was successful. You will receive a confirmation shortly.
          You can verify the invoice anytime with the link from your email.
        </p>
        <Link href="/" className="text-sm text-[#0055FF] hover:underline">
          Back to vyntechsolutions.ca
        </Link>
      </div>
    </div>
  );
}
