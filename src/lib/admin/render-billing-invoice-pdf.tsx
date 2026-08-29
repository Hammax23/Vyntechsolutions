import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { BillingInvoicePdfDocument } from "./billing-invoice-pdf";
import type { BillingInvoiceData } from "./billing-invoice-types";
import { getDocumentVerifyUrl } from "./invoice-verify";

export async function renderBillingInvoicePdf(
  data: BillingInvoiceData,
  origin?: string
): Promise<Buffer> {
  const verifyUrl = getDocumentVerifyUrl(data.invoiceNumber, origin);
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 220,
    errorCorrectionLevel: "M",
  });

  const doc = (
    <BillingInvoicePdfDocument data={data} verifyUrl={verifyUrl} qrDataUrl={qrDataUrl} />
  );
  const buffer = await renderToBuffer(doc);
  return Buffer.from(buffer);
}
