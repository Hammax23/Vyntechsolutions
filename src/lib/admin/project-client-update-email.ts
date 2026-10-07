import {
  PIPELINE_PHASES,
  phaseLabel,
  type ProjectPhase,
} from "@/lib/admin/project-workflow";
import { SITE_URL } from "@/lib/company";

export type ClientUpdateChecklistItem = {
  label: string;
  done: boolean;
};

export type ClientUpdatePaymentItem = {
  label: string;
  status: "paid" | "pending" | "due";
};

export type ClientUpdateSnapshot = {
  projectName: string;
  clientName: string;
  companyName: string;
  /** Absolute URL to VynTech black print logo */
  brandLogoUrl: string;
  brandName: string;
  eyebrow: string;
  phase: string;
  phaseLabel: string;
  phaseIndex: number;
  phaseTotal: number;
  progress: number;
  asOf: string;
  checklistHeading: string;
  paymentsHeading: string;
  noteHeading: string;
  checklist: ClientUpdateChecklistItem[];
  payments: ClientUpdatePaymentItem[];
  note: string;
};

/** Email clients need absolute image URLs. */
export function absoluteAssetUrl(path: string, baseUrl = SITE_URL): string {
  const raw = String(path || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  const base = String(baseUrl || SITE_URL).replace(/\/$/, "");
  return `${base}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

function escapeHtml(s: string): string {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paymentChip(status: string): { label: string; bg: string; color: string } {
  const s = String(status || "").toLowerCase();
  if (s === "paid") return { label: "Paid", bg: "#edf2f7", color: "#1e3a5f" };
  if (s === "due") return { label: "Due", bg: "#f4f4f5", color: "#3f3f46" };
  return { label: "Pending", bg: "#f4f4f5", color: "#52525b" };
}

export function buildClientUpdateSubject(snapshot: ClientUpdateSnapshot): string {
  return `Project update: ${snapshot.projectName} — ${snapshot.phaseLabel} (${snapshot.progress}%)`;
}

export function buildClientUpdatePlainSummary(snapshot: ClientUpdateSnapshot): string {
  const checks = snapshot.checklist
    .map((c) => `${c.done ? "[x]" : "[ ]"} ${c.label}`)
    .join("\n");
  const pays = snapshot.payments
    .map((p) => `- ${p.label}: ${paymentChip(p.status).label}`)
    .join("\n");
  return [
    `${snapshot.projectName} — ${snapshot.phaseLabel} (${snapshot.progress}%)`,
    `As of ${snapshot.asOf}`,
    "",
    "Checklist:",
    checks || "(none)",
    "",
    "Payments:",
    pays || "(none)",
    snapshot.note ? `\nNote:\n${snapshot.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildClientUpdateHtml(snapshot: ClientUpdateSnapshot): string {
  const greetingName = escapeHtml(snapshot.clientName || "there");
  const projectName = escapeHtml(snapshot.projectName);
  const companyName = snapshot.companyName ? escapeHtml(snapshot.companyName) : "";
  const phase = escapeHtml(snapshot.phaseLabel);
  const progress = Math.max(0, Math.min(100, snapshot.progress));
  const asOf = escapeHtml(snapshot.asOf);
  const brandName = escapeHtml(snapshot.brandName || "VynTech Solutions");
  const eyebrow = escapeHtml(snapshot.eyebrow || "Project status update");
  const checklistHeading = escapeHtml(snapshot.checklistHeading || "This phase");
  const paymentsHeading = escapeHtml(snapshot.paymentsHeading || "Payment milestones");
  const noteHeading = escapeHtml(snapshot.noteHeading || "Message from VynTech");

  const brandLogo = snapshot.brandLogoUrl
    ? `<img src="${escapeHtml(snapshot.brandLogoUrl)}" alt="" width="36" height="36" style="display:block;width:36px;height:36px;border:0;outline:none;text-decoration:none;" />`
    : "";

  const brandHeader = `
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;">
      <tr>
        ${
          brandLogo
            ? `<td style="vertical-align:middle;padding:0 12px 0 0;line-height:0;font-size:0;">${brandLogo}</td>`
            : ""
        }
        <td style="vertical-align:middle;">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:700;letter-spacing:-0.02em;color:#0f172a;line-height:1.2;">${brandName}</p>
          <p style="margin:4px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#64748b;line-height:1.3;">${eyebrow}</p>
        </td>
      </tr>
    </table>`;

  const companyLine = companyName
    ? `<p style="margin:4px 0 0;font-family:Arial,Helvetica,sans-serif;color:#64748b;font-size:13px;">${companyName}</p>`
    : "";

  const checklistRows = snapshot.checklist.length
    ? snapshot.checklist
        .map((c) => {
          const mark = c.done ? "✓" : "○";
          const color = c.done ? "#334155" : "#94a3b8";
          const weight = c.done ? "500" : "400";
          return `<tr>
            <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;color:${color};font-size:14px;font-weight:${weight};">
              <span style="display:inline-block;width:18px;">${mark}</span>${escapeHtml(c.label)}
            </td>
          </tr>`;
        })
        .join("")
    : `<tr><td style="padding:8px 0;color:#94a3b8;font-size:14px;">No checklist items listed.</td></tr>`;

  const paymentRows = snapshot.payments.length
    ? snapshot.payments
        .map((p) => {
          const chip = paymentChip(p.status);
          return `<tr>
            <td style="padding:8px 0;border-bottom:1px solid #e8ecf1;font-size:13px;color:#0f172a;">${escapeHtml(p.label)}</td>
            <td style="padding:8px 0;border-bottom:1px solid #e8ecf1;text-align:right;font-size:12px;font-weight:600;color:${chip.color};">${chip.label}</td>
          </tr>`;
        })
        .join("")
    : `<tr><td colspan="2" style="padding:8px 0;color:#94a3b8;font-size:14px;">No payment milestones listed.</td></tr>`;

  const noteBlock = snapshot.note.trim()
    ? `<tr><td style="padding:18px 28px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;">
          <tr><td style="padding:14px 16px;">
            <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;color:#64748b;">${noteHeading}</p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:#0f172a;white-space:pre-wrap;">${escapeHtml(snapshot.note.trim())}</p>
          </td></tr>
        </table>
      </td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${projectName} — project update</title>
</head>
<body style="margin:0;padding:0;background:#eef1f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f4;padding:24px 12px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #d7dde5;">
        <tr>
          <td style="padding:22px 28px 18px;border-bottom:1px solid #e8ecf1;background:#ffffff;">
            ${brandHeader}
          </td>
        </tr>
        <tr>
          <td style="padding:26px 28px 10px;">
            <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#334155;">Hello ${greetingName},</p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:1.35;color:#0f172a;font-weight:700;">${projectName}</p>
            ${companyLine}
          </td>
        </tr>
        <tr>
          <td style="padding:14px 28px 8px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;">
              <tr><td style="padding:14px 16px;">
                <p style="margin:0 0 2px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#64748b;">Current phase</p>
                <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;color:#0f172a;">${phase} · Phase ${snapshot.phaseIndex}/${snapshot.phaseTotal}</p>
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8edf3;height:6px;">
                  <tr>
                    <td style="width:${progress}%;background:#1e3a5f;height:6px;font-size:0;line-height:0;">&nbsp;</td>
                    <td style="font-size:0;line-height:0;">&nbsp;</td>
                  </tr>
                </table>
                <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#475569;">${progress}% complete · As of ${asOf}</p>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px 0;">
            <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;color:#64748b;">${checklistHeading}</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;">${checklistRows}</table>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 28px 0;">
            <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;color:#64748b;">${paymentsHeading}</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;">${paymentRows}</table>
          </td>
        </tr>
        ${noteBlock}
        <tr>
          <td style="padding:24px 28px 28px;font-family:Arial,Helvetica,sans-serif;">
            <p style="margin:0 0 14px;font-size:14px;line-height:1.55;color:#334155;">Questions? Reply to this email and we will get back to you.</p>
            <a href="mailto:info@vyntechsolutions.ca" style="font-size:13px;font-weight:600;color:#1e3a5f;text-decoration:underline;">info@vyntechsolutions.ca</a>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 28px 18px;border-top:1px solid #e8ecf1;font-family:Arial,Helvetica,sans-serif;">
            <p style="margin:0;font-size:11px;line-height:1.5;color:#94a3b8;">Intended for ${greetingName} regarding ${projectName}. Please do not forward without permission.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function paymentStatusForEmail(status: string): "paid" | "pending" | "due" {
  const s = String(status || "").toLowerCase();
  if (s === "paid") return "paid";
  if (s === "due") return "due";
  return "pending";
}

export function phaseIndexForStatus(status: string): number {
  const key = status as ProjectPhase;
  const idx = PIPELINE_PHASES.indexOf(key);
  if (idx >= 0) return idx + 1;
  if (status === "completed") return PIPELINE_PHASES.length;
  return Math.max(1, PIPELINE_PHASES.length);
}

export function formatAsOfDate(d = new Date()): string {
  return d.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export { phaseLabel };
