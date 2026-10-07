import { Suspense } from "react";
import InvoicePaidClient from "./InvoicePaidClient";

export default function InvoicePaidPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-500 text-sm">
          Confirming payment…
        </div>
      }
    >
      <InvoicePaidClient />
    </Suspense>
  );
}
