import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { WorkflowProgressPdfDocument } from "./workflow-progress-pdf";
import type { ProgressReportData } from "./workflow-progress-report-types";

export async function renderWorkflowProgressPdf(data: ProgressReportData): Promise<Buffer> {
  const doc = <WorkflowProgressPdfDocument data={data} />;
  const buffer = await renderToBuffer(doc);
  return Buffer.from(buffer);
}
