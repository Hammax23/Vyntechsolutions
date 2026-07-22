import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { QuotationPdfDocument } from "./quotation-pdf";
import type { QuotationData } from "./quotation-types";

export async function renderQuotationPdf(
  data: QuotationData,
  variant: "client" | "internal" | "both" = "both"
): Promise<Buffer> {
  const doc = <QuotationPdfDocument data={data} variant={variant} />;
  const buffer = await renderToBuffer(doc);
  return Buffer.from(buffer);
}
