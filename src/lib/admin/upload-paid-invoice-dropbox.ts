import prisma from "@/lib/prisma";
import { mapBillingInvoice, logBillingEvent } from "@/lib/admin/billing-invoice-map";
import { renderBillingInvoicePdf } from "@/lib/admin/render-billing-invoice-pdf";
import {
  dropboxEnsurePathFolders,
  dropboxUploadFile,
  getDropboxInvoicesRoot,
  isDropboxConfigured,
} from "@/lib/dropbox";

const UPLOAD_SOFT_TIMEOUT_MS = 8_000;

export type DropboxUploadResult =
  | { ok: true; path: string; skipped?: boolean }
  | { ok: false; error: string; code?: "not_configured" | "not_paid" | "not_found" | "timeout" | "upload_failed" };

function sanitizeInvoiceFileName(invoiceNumber: string): string {
  const cleaned = String(invoiceNumber || "")
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || "invoice";
}

function buildDropboxPath(invoiceNumber: string, paidAt: Date | null): string {
  const when = paidAt && !Number.isNaN(paidAt.getTime()) ? paidAt : new Date();
  const yyyy = String(when.getFullYear());
  const mm = String(when.getMonth() + 1).padStart(2, "0");
  const root = getDropboxInvoicesRoot();
  const file = `${sanitizeInvoiceFileName(invoiceNumber)}.pdf`;
  return `${root}/${yyyy}/${mm}/${file}`;
}

/**
 * Render the paid invoice PDF and archive it to Dropbox.
 * Safe to call from Stripe webhook — never throws (caller may still await).
 */
export async function uploadPaidInvoiceToDropbox(opts: {
  invoiceId: string;
  force?: boolean;
  /** Soft timeout for webhook path (default 8s). Manual API can pass higher. */
  timeoutMs?: number;
}): Promise<DropboxUploadResult> {
  if (!isDropboxConfigured()) {
    const error = "Dropbox is not configured (DROPBOX_APP_KEY / SECRET / REFRESH_TOKEN)";
    try {
      await prisma.billingInvoice.update({
        where: { id: opts.invoiceId },
        data: { dropboxError: error },
      });
    } catch {
      /* ignore */
    }
    return { ok: false, error, code: "not_configured" };
  }

  const invoice = await prisma.billingInvoice.findUnique({ where: { id: opts.invoiceId } });
  if (!invoice || invoice.deletedAt) {
    return { ok: false, error: "Invoice not found", code: "not_found" };
  }
  if (invoice.status !== "paid") {
    return { ok: false, error: "Only paid invoices can be archived to Dropbox", code: "not_paid" };
  }

  // Webhook retries: skip if already archived unless force
  if (invoice.dropboxPath && !opts.force) {
    return { ok: true, path: invoice.dropboxPath, skipped: true };
  }

  const timeoutMs = opts.timeoutMs ?? UPLOAD_SOFT_TIMEOUT_MS;

  const doUpload = async (): Promise<string> => {
    const mapped = mapBillingInvoice(invoice);
    const pdfBuffer = await renderBillingInvoicePdf({
      ...mapped,
      status: "paid",
      amountPaid: mapped.amountPaid || invoice.amountPaid,
      paidAt: mapped.paidAt || (invoice.paidAt ? invoice.paidAt.toISOString() : ""),
    });

    const path = buildDropboxPath(invoice.invoiceNumber, invoice.paidAt);
    // Parent of file = .../YYYY/MM — create every segment including nested root
    const folder = path.replace(/\/[^/]+$/, "");
    await dropboxEnsurePathFolders(folder);

    const uploaded = await dropboxUploadFile({
      path,
      contents: pdfBuffer,
      mode: "overwrite",
    });
    return uploaded.pathDisplay;
  };

  const persistSuccess = async (path: string) => {
    await prisma.billingInvoice.update({
      where: { id: invoice.id },
      data: {
        dropboxPath: path,
        dropboxUploadedAt: new Date(),
        dropboxError: null,
      },
    });
    await logBillingEvent(prisma, invoice.id, "dropbox_uploaded", {
      path,
      forced: Boolean(opts.force),
    });
  };

  const persistFailure = async (message: string, code: string) => {
    // Never clobber a successful archive if a late timeout/error races in
    const latest = await prisma.billingInvoice.findUnique({
      where: { id: invoice.id },
      select: { dropboxPath: true },
    });
    if (latest?.dropboxPath) return;

    await prisma.billingInvoice.update({
      where: { id: invoice.id },
      data: { dropboxError: message },
    });
    await logBillingEvent(prisma, invoice.id, "dropbox_failed", {
      error: message,
      code,
      forced: Boolean(opts.force),
    });
  };

  try {
    // Soft timeout for Stripe webhook: if slow, return error for retry UI,
    // but let the in-flight upload finish and still persist success.
    const uploadPromise = doUpload();
    type Race =
      | { kind: "ok"; path: string }
      | { kind: "timeout" };

    const raced: Race = await Promise.race([
      uploadPromise.then((path) => ({ kind: "ok" as const, path })),
      new Promise<Race>((resolve) =>
        setTimeout(() => resolve({ kind: "timeout" }), timeoutMs)
      ),
    ]);

    if (raced.kind === "ok") {
      await persistSuccess(raced.path);
      return { ok: true, path: raced.path };
    }

    void uploadPromise
      .then(async (path) => {
        await persistSuccess(path);
      })
      .catch(async (e) => {
        const message = e instanceof Error ? e.message : "Dropbox upload failed";
        try {
          await persistFailure(message, "upload_failed");
        } catch {
          /* ignore */
        }
      });

    const timeoutMsg = "Dropbox upload timed out — use Save to Dropbox to retry";
    try {
      await persistFailure(timeoutMsg, "timeout");
    } catch {
      /* ignore */
    }
    return { ok: false, error: timeoutMsg, code: "timeout" };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Dropbox upload failed";
    try {
      await persistFailure(message, "upload_failed");
    } catch {
      /* ignore */
    }
    return { ok: false, error: message, code: "upload_failed" };
  }
}
