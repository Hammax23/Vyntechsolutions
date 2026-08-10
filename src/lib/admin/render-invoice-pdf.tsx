import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { InvoicePdfDocument } from "./invoice-pdf";
import type { InvoiceData } from "./invoice-types";
import { getDocumentVerifyUrl } from "./invoice-verify";

export async function renderInvoicePdf(data: InvoiceData, origin?: string): Promise<Buffer> {
  const verifyUrl = getDocumentVerifyUrl(data.documentNumber, origin);
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 220,
    errorCorrectionLevel: "M",
  });

  const doc = <InvoicePdfDocument data={data} verifyUrl={verifyUrl} qrDataUrl={qrDataUrl} />;
  const buffer = await renderToBuffer(doc);
  return Buffer.from(buffer);
}
