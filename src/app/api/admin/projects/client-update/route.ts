import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  ensureProjectWorkflow,
  syncProjectProgress,
} from "@/lib/admin/seed-project-workflow";
import { phaseLabel } from "@/lib/admin/project-workflow";
import {
  absoluteAssetUrl,
  buildClientUpdateHtml,
  buildClientUpdateSubject,
  formatAsOfDate,
  paymentStatusForEmail,
  phaseIndexForStatus,
  type ClientUpdateSnapshot,
} from "@/lib/admin/project-client-update-email";
import { SITE_URL } from "@/lib/company";
import {
  getAdminTestAddress,
  getArchiveBccAddress,
  isValidEmail,
  MailError,
  sendMail,
} from "@/lib/mail";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const COOLDOWN_MS = 45_000;
const ARCHIVE_BCC = getArchiveBccAddress();

function normalizeEmail(addr: string): string {
  return String(addr || "").trim().toLowerCase();
}

function mapPaymentStatus(status: string): "paid" | "pending" | "due" {
  return paymentStatusForEmail(status);
}

async function loadProjectBundle(projectId: string) {
  await ensureProjectWorkflow(projectId);
  await syncProjectProgress(projectId);
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      phaseChecks: { orderBy: { sortOrder: "asc" } },
      payments: { orderBy: { sortOrder: "asc" } },
    },
  });
}

function buildSnapshot(
  project: NonNullable<Awaited<ReturnType<typeof loadProjectBundle>>>,
  note: string,
  assetBase: string
): ClientUpdateSnapshot {
  const phase = project.status;
  const checklist = project.phaseChecks
    .filter((c) => c.phase === phase)
    .map((c) => ({ label: c.label, done: c.done }));

  return {
    projectName: project.projectName,
    clientName: project.clientName,
    companyName: project.companyName || "",
    brandLogoUrl: absoluteAssetUrl("/logo-print.png", assetBase),
    brandName: "VynTech Solutions",
    eyebrow: "Project status update",
    phase,
    phaseLabel: phaseLabel(phase),
    phaseIndex: phaseIndexForStatus(phase),
    phaseTotal: 9,
    progress: project.progress,
    asOf: formatAsOfDate(),
    checklistHeading: "This phase",
    paymentsHeading: "Payment milestones",
    noteHeading: "Message from VynTech",
    checklist,
    payments: project.payments.map((p) => ({
      label: p.label,
      status: mapPaymentStatus(p.status),
    })),
    note: note.trim(),
  };
}

function normalizeIncomingSnapshot(
  base: ClientUpdateSnapshot,
  raw: unknown
): ClientUpdateSnapshot {
  if (!raw || typeof raw !== "object") return base;
  const s = raw as Record<string, unknown>;
  const checklist = Array.isArray(s.checklist)
    ? s.checklist
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const row = item as Record<string, unknown>;
          const label = String(row.label || "").trim();
          if (!label) return null;
          return { label, done: Boolean(row.done) };
        })
        .filter(Boolean) as ClientUpdateSnapshot["checklist"]
    : base.checklist;
  const payments = Array.isArray(s.payments)
    ? s.payments
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const row = item as Record<string, unknown>;
          const label = String(row.label || "").trim();
          if (!label) return null;
          const st = String(row.status || "pending").toLowerCase();
          return {
            label,
            status: (st === "paid" || st === "due" ? st : "pending") as
              | "paid"
              | "pending"
              | "due",
          };
        })
        .filter(Boolean) as ClientUpdateSnapshot["payments"]
    : base.payments;

  const progressRaw = Number(s.progress);
  const phaseIndexRaw = Number(s.phaseIndex);
  const phaseTotalRaw = Number(s.phaseTotal);

  return {
    ...base,
    projectName: String(s.projectName ?? base.projectName).trim() || base.projectName,
    clientName: String(s.clientName ?? base.clientName).trim() || base.clientName,
    companyName: String(s.companyName ?? base.companyName).trim(),
    brandName: String(s.brandName ?? base.brandName).trim() || base.brandName,
    eyebrow: String(s.eyebrow ?? base.eyebrow).trim() || base.eyebrow,
    phaseLabel: String(s.phaseLabel ?? base.phaseLabel).trim() || base.phaseLabel,
    phaseIndex: Number.isFinite(phaseIndexRaw)
      ? Math.max(1, Math.round(phaseIndexRaw))
      : base.phaseIndex,
    phaseTotal: Number.isFinite(phaseTotalRaw)
      ? Math.max(1, Math.round(phaseTotalRaw))
      : base.phaseTotal,
    progress: Number.isFinite(progressRaw)
      ? Math.max(0, Math.min(100, Math.round(progressRaw)))
      : base.progress,
    asOf: String(s.asOf ?? base.asOf).trim() || base.asOf,
    checklistHeading:
      String(s.checklistHeading ?? base.checklistHeading).trim() || base.checklistHeading,
    paymentsHeading:
      String(s.paymentsHeading ?? base.paymentsHeading).trim() || base.paymentsHeading,
    noteHeading: String(s.noteHeading ?? base.noteHeading).trim() || base.noteHeading,
    checklist,
    payments,
    note: String(s.note ?? base.note),
    // Always ship production brand mark for real emails
    brandLogoUrl: absoluteAssetUrl("/logo-print.png", SITE_URL),
  };
}

function assetBaseFromRequest(request: NextRequest): string {
  const origin = request.nextUrl?.origin;
  if (origin && !origin.includes("0.0.0.0")) return origin;
  return SITE_URL;
}

function preflightIssues(to: string): string[] {
  const issues: string[] = [];
  if (!String(to || "").trim()) issues.push("Client email is missing");
  else if (!isValidEmail(to)) issues.push("Client email looks invalid");
  return issues;
}

export async function GET(request: NextRequest) {
  try {
    const projectId = String(request.nextUrl.searchParams.get("projectId") || "").trim();
    if (!projectId) {
      return NextResponse.json({ error: "projectId required" }, { status: 400 });
    }

    if (request.nextUrl.searchParams.get("history") === "1") {
      const limitRaw = Number(request.nextUrl.searchParams.get("limit") || 100);
      const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 100;
      const [rows, total] = await Promise.all([
        prisma.projectClientUpdate.findMany({
          where: { projectId },
          orderBy: { createdAt: "desc" },
          take: limit,
          select: {
            id: true,
            sentTo: true,
            subject: true,
            messageNote: true,
            snapshot: true,
            kind: true,
            status: true,
            errorMessage: true,
            bccTo: true,
            sentBy: true,
            createdAt: true,
          },
        }),
        prisma.projectClientUpdate.count({ where: { projectId } }),
      ]);
      return NextResponse.json({
        total,
        history: rows.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        })),
      });
    }

    const recordId = String(request.nextUrl.searchParams.get("id") || "").trim();
    if (recordId) {
      const row = await prisma.projectClientUpdate.findFirst({
        where: { id: recordId, projectId },
      });
      if (!row) {
        return NextResponse.json({ error: "Update not found" }, { status: 404 });
      }
      const snap =
        row.snapshot && typeof row.snapshot === "object"
          ? (row.snapshot as ClientUpdateSnapshot)
          : ({} as ClientUpdateSnapshot);
      const origin = assetBaseFromRequest(request);
      const snapshot: ClientUpdateSnapshot = {
        ...snap,
        projectName: snap.projectName || "",
        clientName: snap.clientName || "",
        companyName: snap.companyName || "",
        brandLogoUrl: absoluteAssetUrl("/logo-print.png", origin),
        brandName: snap.brandName || "VynTech Solutions",
        eyebrow: snap.eyebrow || "Project status update",
        phase: snap.phase || "",
        phaseLabel: snap.phaseLabel || "",
        phaseIndex: typeof snap.phaseIndex === "number" ? snap.phaseIndex : 0,
        phaseTotal: typeof snap.phaseTotal === "number" ? snap.phaseTotal : 9,
        progress: typeof snap.progress === "number" ? snap.progress : 0,
        asOf: snap.asOf || "",
        checklistHeading: snap.checklistHeading || "This phase",
        paymentsHeading: snap.paymentsHeading || "Payment milestones",
        noteHeading: snap.noteHeading || "Message from VynTech",
        checklist: Array.isArray(snap.checklist) ? snap.checklist : [],
        payments: Array.isArray(snap.payments) ? snap.payments : [],
        note: snap.note || row.messageNote || "",
      };
      return NextResponse.json({
        record: {
          id: row.id,
          sentTo: row.sentTo,
          subject: row.subject,
          messageNote: row.messageNote,
          kind: row.kind,
          status: row.status,
          errorMessage: row.errorMessage,
          bccTo: row.bccTo,
          sentBy: row.sentBy,
          createdAt: row.createdAt.toISOString(),
          snapshot,
          html: buildClientUpdateHtml(snapshot),
        },
      });
    }

    const project = await loadProjectBundle(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const note = String(request.nextUrl.searchParams.get("note") || "");
    const to = String(project.clientEmail || "").trim();
    const snapshot = buildSnapshot(project, note, assetBaseFromRequest(request));
    const subject = buildClientUpdateSubject(snapshot);
    const html = buildClientUpdateHtml(snapshot);
    const issues = preflightIssues(to);
    const testTo = getAdminTestAddress();

    return NextResponse.json({
      to,
      subject,
      html,
      snapshot,
      testTo,
      preflight: { ok: issues.length === 0, issues },
    });
  } catch (error) {
    console.error("client-update GET", error);
    return NextResponse.json({ error: "Failed to build preview" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const projectId = String(body.projectId || "").trim();
    const idempotencyKey = String(body.idempotencyKey || "").trim();
    const kind = body.kind === "test" ? "test" : "client";
    const note = String(body.note || "");
    const subjectOverride = body.subject != null ? String(body.subject).trim() : "";
    const toOverride = body.to != null ? String(body.to).trim() : "";

    if (!projectId) {
      return NextResponse.json({ error: "projectId required" }, { status: 400 });
    }
    if (!idempotencyKey) {
      return NextResponse.json({ error: "idempotencyKey required" }, { status: 400 });
    }

    const existingLog = await prisma.projectClientUpdate.findUnique({
      where: { idempotencyKey },
    });
    if (existingLog?.status === "sent") {
      return NextResponse.json({
        ok: true,
        logId: existingLog.id,
        duplicate: true,
        kind: existingLog.kind,
        sentTo: existingLog.sentTo,
      });
    }

    const project = await loadProjectBundle(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const testTo = getAdminTestAddress();
    const to =
      kind === "test"
        ? testTo
        : toOverride || String(project.clientEmail || "").trim();

    if (!isValidEmail(to)) {
      return NextResponse.json(
        { error: kind === "test" ? "Admin test email is not configured" : "Valid recipient email required" },
        { status: 400 }
      );
    }

    if (kind === "client") {
      const lastOk = await prisma.projectClientUpdate.findFirst({
        where: { projectId, kind: "client", status: "sent" },
        orderBy: { createdAt: "desc" },
      });
      if (lastOk && Date.now() - lastOk.createdAt.getTime() < COOLDOWN_MS) {
        return NextResponse.json(
          {
            error: "Please wait a moment before sending another update to this client.",
            code: "COOLDOWN",
          },
          { status: 429 }
        );
      }
    }

    const snapshot = normalizeIncomingSnapshot(
      buildSnapshot(project, note, SITE_URL),
      body.snapshot
    );
    if (body.clientName != null) snapshot.clientName = String(body.clientName).trim() || snapshot.clientName;
    if (body.projectName != null) snapshot.projectName = String(body.projectName).trim() || snapshot.projectName;
    if (body.companyName != null) snapshot.companyName = String(body.companyName).trim();
    if (body.note != null) snapshot.note = String(body.note);
    const subject = subjectOverride || buildClientUpdateSubject(snapshot);
    const html = buildClientUpdateHtml(snapshot);
    const bccCandidate = ARCHIVE_BCC;
    const bccTo =
      kind === "client" && normalizeEmail(bccCandidate) !== normalizeEmail(to)
        ? bccCandidate
        : null;

    try {
      await sendMail({
        to,
        subject,
        html,
        bcc: bccTo,
        replyTo: "info@vyntechsolutions.ca",
      });
    } catch (e) {
      const message =
        e instanceof MailError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Email could not be sent";

      if (existingLog && existingLog.status === "failed") {
        await prisma.projectClientUpdate.update({
          where: { id: existingLog.id },
          data: {
            errorMessage: message,
            sentTo: to,
            subject,
            messageNote: note || null,
            snapshot,
            kind,
            bccTo,
          },
        });
      } else {
        await prisma.projectClientUpdate.create({
          data: {
            projectId,
            sentTo: to,
            subject,
            messageNote: note || null,
            snapshot,
            kind,
            status: "failed",
            errorMessage: message,
            idempotencyKey,
            bccTo,
            sentBy: "Admin",
          },
        });
      }

      await prisma.activityLog.create({
        data: {
          projectId,
          action: `Client update failed to send (${kind})`,
          user: "Admin",
        },
      });

      return NextResponse.json(
        { error: message, code: e instanceof MailError ? e.code : "SMTP_FAILED" },
        { status: 502 }
      );
    }

    let logId: string;
    if (existingLog && existingLog.status === "failed") {
      const updated = await prisma.projectClientUpdate.update({
        where: { id: existingLog.id },
        data: {
          status: "sent",
          errorMessage: null,
          sentTo: to,
          subject,
          messageNote: note || null,
          snapshot,
          kind,
          bccTo,
        },
      });
      logId = updated.id;
    } else {
      const created = await prisma.projectClientUpdate.create({
        data: {
          projectId,
          sentTo: to,
          subject,
          messageNote: note || null,
          snapshot,
          kind,
          status: "sent",
          idempotencyKey,
          bccTo,
          sentBy: "Admin",
        },
      });
      logId = created.id;
    }

    if (kind === "client") {
      await prisma.activityLog.create({
        data: {
          projectId,
          action: `Client update emailed to ${to}`,
          user: "Admin",
        },
      });

      if (normalizeEmail(to) !== normalizeEmail(project.clientEmail || "")) {
        await prisma.project.update({
          where: { id: projectId },
          data: { clientEmail: to },
        });
        await prisma.activityLog.create({
          data: {
            projectId,
            action: "Client email updated for updates",
            user: "Admin",
          },
        });
      }
    } else {
      await prisma.activityLog.create({
        data: {
          projectId,
          action: `Test client update sent to ${to}`,
          user: "Admin",
        },
      });
    }

    return NextResponse.json({
      ok: true,
      logId,
      kind,
      sentTo: to,
      progress: project.progress,
      clientEmail: kind === "client" ? to : project.clientEmail,
    });
  } catch (error) {
    console.error("client-update POST", error);
    return NextResponse.json({ error: "Failed to send client update" }, { status: 500 });
  }
}
