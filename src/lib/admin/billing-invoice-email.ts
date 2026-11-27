import { COMPANY_EMAIL, SITE_URL } from "@/lib/company";
import {
  calculateBillingTotals,
  formatCad,
  type BillingInvoiceData,
} from "@/lib/admin/billing-invoice-types";
import { getDocumentVerifyUrl } from "@/lib/admin/invoice-verify";
import { PRINT_LOGO_CID } from "@/lib/admin/pdf-logo";

const COMPANY_WEB = "www.vyntechsolutions.ca";
const NAVY = "#0F2A5F";
const BLUE = "#1B4F9C";

function escapeHtml(s: string) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Professional totals block — Discount row only when discount % applied. */
function billingTotalsEmailRows(opts: {
  invoice: BillingInvoiceData;
  totals: ReturnType<typeof calculateBillingTotals>;
  includeBalance?: boolean;
}) {
  const { invoice, totals } = opts;
  const includeBalance = opts.includeBalance !== false;
  const discountPct = Number(invoice.discountPercent) || 0;
  const hstPct = Number(invoice.hstPercent) || 0;
  const showDiscount = totals.discount > 0.009 && discountPct > 0;

  const row = (label: string, value: string, last = false, strong = false) => `
            <tr>
              <td style="padding:8px 0;${last ? "" : "border-bottom:1px solid #E2E8F0;"}">${label}</td>
              <td style="padding:8px 0;${last ? "" : "border-bottom:1px solid #E2E8F0;"}text-align:right;color:#0f172a;${strong ? "font-weight:700;" : ""}">${value}</td>
            </tr>`;

  return [
    invoice.projectTitle
      ? row("Project", escapeHtml(invoice.projectTitle))
      : "",
    row("Subtotal", formatCad(totals.subtotal)),
    showDiscount
      ? row(
          `Discount (${discountPct}%)`,
          `−${formatCad(totals.discount)}`
        )
      : "",
    row(`HST (${hstPct}%)`, formatCad(totals.hst)),
    row("Total", formatCad(totals.total), !includeBalance, true),
    includeBalance
      ? row("Balance due", formatCad(totals.balance), true, true)
      : "",
  ]
    .filter(Boolean)
    .join("");
}

export function buildBillingInvoiceEmail(opts: {
  invoice: BillingInvoiceData;
  payUrl?: string | null;
  verifyOrigin?: string;
}) {
  const totals = calculateBillingTotals(opts.invoice);
  const origin = opts.verifyOrigin || SITE_URL;
  const verifyUrl = getDocumentVerifyUrl(opts.invoice.invoiceNumber, origin);
  const payUrl = opts.payUrl || opts.invoice.checkoutUrl || "";
  const due = opts.invoice.dueDate || "—";
  // Inline CID — email clients cannot load localhost / blocked remote images
  const logoSrc = `cid:${PRINT_LOGO_CID}`;

  // Keep subject clean — no giant "$X due" in the inbox preview
  const subject = `Invoice ${opts.invoice.invoiceNumber} from VynTech Solutions`;

  const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f4f6f8;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#1F2937;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #E2E8F0;">
        <!-- PDF-matching brand header -->
        <tr>
          <td style="padding:24px 28px 12px 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td valign="middle" style="vertical-align:middle;">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td valign="middle" style="padding-right:12px;">
                        <img src="${logoSrc}" alt="VynTech" width="48" height="48" style="display:block;width:48px;height:48px;object-fit:contain;border:0;" />
                      </td>
                      <td valign="middle">
                        <p style="margin:0;font-size:16px;font-weight:700;color:${NAVY};letter-spacing:0.3px;line-height:1.2;">VynTech Solutions</p>
                        <p style="margin:3px 0 0;font-size:11px;color:#64748B;">Invoice ${escapeHtml(opts.invoice.invoiceNumber)}</p>
                      </td>
                    </tr>
                  </table>
                </td>
                <td valign="middle" align="right" style="vertical-align:middle;text-align:right;">
                  <p style="margin:0;font-size:11px;color:#64748B;line-height:1.45;">${escapeHtml(COMPANY_EMAIL)}</p>
                  <p style="margin:2px 0 0;font-size:11px;color:#64748B;line-height:1.45;">${escapeHtml(COMPANY_WEB)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 28px 18px 28px;">
            <div style="height:3px;background:${BLUE};line-height:3px;font-size:0;">&nbsp;</div>
          </td>
        </tr>
        <tr><td style="padding:8px 28px 28px 28px;">
          <p style="margin:0 0 12px;font-size:15px;color:#0f172a;">Hello ${escapeHtml(opts.invoice.clientName || "there")},</p>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.55;color:#334155;">
            Please find your invoice attached
            ${opts.invoice.dueDate ? ` (due <strong>${escapeHtml(due)}</strong>)` : ""}.
          </p>
          <table role="presentation" width="100%" style="margin:0 0 20px;font-size:13px;color:#475569;border-collapse:collapse;">
            ${billingTotalsEmailRows({ invoice: opts.invoice, totals, includeBalance: true })}
          </table>
          ${
            payUrl && totals.balance > 0
              ? `<p style="margin:0 0 12px;"><a href="${escapeHtml(payUrl)}" style="display:inline-block;background:#0055FF;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600;">Pay now</a></p>`
              : ""
          }
          <p style="margin:16px 0 0;font-size:12px;color:#64748b;">
            Verify this invoice: <a href="${escapeHtml(verifyUrl)}" style="color:${BLUE};">${escapeHtml(verifyUrl)}</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    `Invoice ${opts.invoice.invoiceNumber} — VynTech Solutions`,
    opts.invoice.dueDate ? `Due: ${opts.invoice.dueDate}` : "",
    opts.invoice.projectTitle ? `Project: ${opts.invoice.projectTitle}` : "",
    `Subtotal: ${formatCad(totals.subtotal)}`,
    totals.discount > 0.009
      ? `Discount (${Number(opts.invoice.discountPercent) || 0}%): -${formatCad(totals.discount)}`
      : "",
    `HST (${Number(opts.invoice.hstPercent) || 0}%): ${formatCad(totals.hst)}`,
    `Total: ${formatCad(totals.total)}`,
    `Balance due: ${formatCad(totals.balance)}`,
    payUrl ? `Pay: ${payUrl}` : "",
    `Verify: ${verifyUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text, verifyUrl };
}

/** Receipt after offline (or confirmed) payment — Paid PDF attached by caller. */
export function buildBillingPaymentReceivedEmail(opts: {
  invoice: BillingInvoiceData;
  verifyOrigin?: string;
}) {
  const totals = calculateBillingTotals(opts.invoice);
  const origin = opts.verifyOrigin || SITE_URL;
  const verifyUrl = getDocumentVerifyUrl(opts.invoice.invoiceNumber, origin);
  const logoSrc = `cid:${PRINT_LOGO_CID}`;
  const method = opts.invoice.paymentMethod || "—";
  const reference = opts.invoice.paymentReference || "";
  const paidAt = opts.invoice.paidAt
    ? opts.invoice.paidAt.slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  const subject = `Payment received — Invoice ${opts.invoice.invoiceNumber}`;

  const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f4f6f8;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#1F2937;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #E2E8F0;">
        <tr>
          <td style="padding:24px 28px 12px 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td valign="middle">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td valign="middle" style="padding-right:12px;">
                        <img src="${logoSrc}" alt="VynTech" width="48" height="48" style="display:block;width:48px;height:48px;object-fit:contain;border:0;" />
                      </td>
                      <td valign="middle">
                        <p style="margin:0;font-size:16px;font-weight:700;color:${NAVY};">VynTech Solutions</p>
                        <p style="margin:3px 0 0;font-size:11px;color:#64748B;">Payment confirmation</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 28px 18px 28px;">
            <div style="height:3px;background:${BLUE};line-height:3px;font-size:0;">&nbsp;</div>
          </td>
        </tr>
        <tr><td style="padding:8px 28px 28px 28px;">
          <p style="margin:0 0 12px;font-size:15px;color:#0f172a;">Hello ${escapeHtml(opts.invoice.clientName || "there")},</p>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.55;color:#334155;">
            We have received your payment for invoice <strong>${escapeHtml(opts.invoice.invoiceNumber)}</strong>.
            A paid copy is attached for your records.
          </p>
          <table role="presentation" width="100%" style="margin:0 0 20px;font-size:13px;color:#475569;border-collapse:collapse;">
            ${billingTotalsEmailRows({ invoice: opts.invoice, totals, includeBalance: false })}
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #E2E8F0;">Amount paid</td>
              <td style="padding:8px 0;border-bottom:1px solid #E2E8F0;text-align:right;color:#0f172a;font-weight:700;">${formatCad(opts.invoice.amountPaid || totals.total)}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #E2E8F0;">Payment method</td>
              <td style="padding:8px 0;border-bottom:1px solid #E2E8F0;text-align:right;color:#0f172a;">${escapeHtml(method)}</td>
            </tr>
            ${
              reference
                ? `<tr>
              <td style="padding:8px 0;border-bottom:1px solid #E2E8F0;">Reference</td>
              <td style="padding:8px 0;border-bottom:1px solid #E2E8F0;text-align:right;color:#0f172a;">${escapeHtml(reference)}</td>
            </tr>`
                : ""
            }
            <tr>
              <td style="padding:8px 0;">Paid on</td>
              <td style="padding:8px 0;text-align:right;color:#0f172a;">${escapeHtml(paidAt)}</td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:12px;color:#64748b;">
            Verify this invoice: <a href="${escapeHtml(verifyUrl)}" style="color:${BLUE};">${escapeHtml(verifyUrl)}</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    `Payment received — Invoice ${opts.invoice.invoiceNumber}`,
    `Subtotal: ${formatCad(totals.subtotal)}`,
    totals.discount > 0.009
      ? `Discount (${Number(opts.invoice.discountPercent) || 0}%): -${formatCad(totals.discount)}`
      : "",
    `HST (${Number(opts.invoice.hstPercent) || 0}%): ${formatCad(totals.hst)}`,
    `Total: ${formatCad(totals.total)}`,
    `Amount paid: ${formatCad(opts.invoice.amountPaid || totals.total)}`,
    `Method: ${method}`,
    reference ? `Reference: ${reference}` : "",
    `Paid on: ${paidAt}`,
    `Verify: ${verifyUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text, verifyUrl };
}
