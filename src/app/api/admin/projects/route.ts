import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  advanceGateError,
  normalizeProjectStatus,
  parsePhaseGates,
  type PhaseGate,
} from "@/lib/admin/project-workflow";
import {
  ensureProjectWorkflow,
  projectInclude,
  seedNewProjectWorkflow,
  syncProjectProgress,
} from "@/lib/admin/seed-project-workflow";
import { removeProjectLogo, saveProjectLogo } from "@/lib/admin/project-logo";
import { actorNameFromRequest } from "@/lib/admin/actor";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parseServices(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s).trim()).filter(Boolean);
  }
  return String(raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Date-only values (YYYY-MM-DD) → noon UTC so TZ shifts don't change the calendar day. */
function parseDateOnly(value: unknown): Date | null {
  if (value == null || value === "") return null;
  const s = String(value).trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) {
    return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0));
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function readCreatePayload(request: NextRequest): Promise<{
  fields: Record<string, unknown>;
  logoFile: File | null;
}> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const fields: Record<string, unknown> = {};
    for (const [key, value] of form.entries()) {
      if (key === "logo" || key === "companyLogo") continue;
      fields[key] = typeof value === "string" ? value : String(value);
    }
    const logo = form.get("logo") || form.get("companyLogo");
    return {
      fields,
      logoFile: logo instanceof File && logo.size > 0 ? logo : null,
    };
  }
  const data = await request.json();
  return { fields: data as Record<string, unknown>, logoFile: null };
}

// GET all projects with related data (+ lazy workflow seed)
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: projectInclude,
      orderBy: { createdAt: "desc" },
    });

    const ensured = await Promise.all(
      projects.map(async (p) => {
        if (p.phaseChecks.length === 0 || p.payments.length === 0 || p.status === "launch") {
          const full = await ensureProjectWorkflow(p.id, p.budget);
          return full || p;
        }
        const percent = await syncProjectProgress(p.id);
        return percent !== p.progress ? { ...p, progress: percent } : p;
      })
    );

    return NextResponse.json({ projects: ensured });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

// POST create new project (JSON or multipart with optional company logo)
export async function POST(request: NextRequest) {
  let savedLogo: string | null = null;
  try {
    const actor = await actorNameFromRequest(request);
    const { fields: data, logoFile } = await readCreatePayload(request);
    const projectName = String(data.projectName || "").trim();
    const clientName = String(data.clientName || "").trim();
    const clientEmail = String(data.clientEmail || "").trim();
    const clientPhone = String(data.clientPhone || "").trim();
    if (!projectName) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }
    if (!clientName) {
      return NextResponse.json({ error: "Client name is required" }, { status: 400 });
    }
    if (!clientEmail) {
      return NextResponse.json({ error: "Client email is required" }, { status: 400 });
    }
    if (!clientPhone) {
      return NextResponse.json({ error: "Client phone is required" }, { status: 400 });
    }

    if (logoFile) {
      savedLogo = await saveProjectLogo(logoFile);
    } else if (typeof data.companyLogo === "string" && data.companyLogo.trim()) {
      savedLogo = data.companyLogo.trim();
    }

    const budget = Number(data.budget) || 0;
    const services = parseServices(data.services);
    const teamMembers = Array.isArray(data.teamMembers)
      ? data.teamMembers.map((s: unknown) => String(s))
      : [];

    const project = await prisma.project.create({
      data: {
        projectName,
        description: String(data.description || ""),
        clientName,
        clientEmail,
        clientPhone,
        companyName: String(data.companyName || ""),
        companyLogo: savedLogo,
        services,
        status: normalizeProjectStatus(String(data.status || "discovery")),
        priority: String(data.priority || "medium"),
        progress: Number(data.progress) || 0,
        budget,
        spent: Number(data.spent) || 0,
        startDate: parseDateOnly(data.startDate),
        deadline: parseDateOnly(data.deadline),
        teamMembers,
        phaseGates: [],
        activityLogs: {
          create: {
            action: savedLogo ? "Project created with company logo" : "Project created",
            user: actor,
          },
        },
      },
    });

    await seedNewProjectWorkflow(project.id, budget);

    const full = await prisma.project.findUnique({
      where: { id: project.id },
      include: projectInclude,
    });

    return NextResponse.json({ project: full });
  } catch (error) {
    if (savedLogo) await removeProjectLogo(savedLogo);
    console.error("Error creating project:", error);
    const msg = error instanceof Error ? error.message : "Failed to create project";
    const status = /logo|image|MB/i.test(msg) ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

// PATCH update project (JSON, or multipart for company logo)
export async function PATCH(request: NextRequest) {
  let savedLogo: string | null = null;
  try {
    const actor = await actorNameFromRequest(request);
    const contentType = request.headers.get("content-type") || "";
    let data: Record<string, unknown>;
    let logoFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      data = {};
      for (const [key, value] of form.entries()) {
        if (key === "logo" || key === "companyLogoFile") continue;
        data[key] = typeof value === "string" ? value : String(value);
      }
      const logo = form.get("logo") || form.get("companyLogoFile");
      logoFile = logo instanceof File && logo.size > 0 ? logo : null;
    } else {
      data = (await request.json()) as Record<string, unknown>;
    }

    const { id, force, phaseGate, ...rest } = data;

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const existing = await prisma.project.findUnique({ where: { id: String(id) } });
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await ensureProjectWorkflow(String(id), existing.budget);

    const updateData: Record<string, unknown> = { ...rest };
    delete updateData.phaseChecks;
    delete updateData.payments;
    delete updateData.tasks;
    delete updateData.milestones;
    delete updateData.notes;
    delete updateData.activityLogs;
    delete updateData.activityLog;

    if (logoFile) {
      savedLogo = await saveProjectLogo(logoFile);
      updateData.companyLogo = savedLogo;
    }

    if (updateData.startDate !== undefined) {
      updateData.startDate = parseDateOnly(updateData.startDate);
    }
    if (updateData.deadline !== undefined) {
      updateData.deadline = parseDateOnly(updateData.deadline);
    }
    if (updateData.services !== undefined) {
      updateData.services = parseServices(updateData.services);
    }
    if (updateData.budget !== undefined) {
      updateData.budget = Number(updateData.budget) || 0;
    }
    if (updateData.spent !== undefined) {
      updateData.spent = Number(updateData.spent) || 0;
    }
    for (const key of [
      "projectName",
      "clientName",
      "clientEmail",
      "clientPhone",
      "companyName",
      "description",
    ] as const) {
      if (typeof updateData[key] === "string") {
        updateData[key] = String(updateData[key]).trim();
      }
    }

    const requiredLabels: Record<string, string> = {
      projectName: "Project name",
      clientName: "Client name",
      clientEmail: "Client email",
      clientPhone: "Client phone",
    };
    for (const key of Object.keys(requiredLabels)) {
      if (updateData[key] !== undefined && !String(updateData[key] || "").trim()) {
        return NextResponse.json(
          { error: `${requiredLabels[key]} is required` },
          { status: 400 }
        );
      }
    }

    const budgetChanged =
      typeof updateData.budget === "number" &&
      updateData.budget !== existing.budget;

    if (budgetChanged) {
      // Only rewrite unpaid milestones when budget actually changes
      const payments = await prisma.projectPayment.findMany({
        where: { projectId: String(id) },
      });
      for (const pay of payments) {
        if (pay.status !== "paid") {
          await prisma.projectPayment.update({
            where: { id: pay.id },
            data: {
              amount:
                Math.round(
                  (((updateData.budget as number) * pay.percent) / 100) * 100
                ) / 100,
            },
          });
        }
      }
    }

    let gates = parsePhaseGates(existing.phaseGates);
    const gatePayload =
      phaseGate && typeof phaseGate === "object"
        ? (phaseGate as { phase?: unknown; note?: unknown })
        : null;

    if (gatePayload) {
      const phase = normalizeProjectStatus(String(gatePayload.phase || ""));
      const note = gatePayload.note ? String(gatePayload.note) : undefined;
      const signedOffAt = new Date().toISOString();
      gates = [
        ...gates.filter((g) => g.phase !== phase),
        { phase, signedOffAt, note } satisfies PhaseGate,
      ];
      updateData.phaseGates = gates;
    }

    if (updateData.status) {
      const nextStatus = normalizeProjectStatus(String(updateData.status));
      updateData.status = nextStatus;
      const gateErr = advanceGateError(existing.status, nextStatus, gates, Boolean(force));
      if (gateErr) {
        return NextResponse.json(
          { error: gateErr, code: "PHASE_GATE", requiresForce: true },
          { status: 400 }
        );
      }
    }

    const activityData: { action: string; user: string }[] = [];
    if (updateData.status && updateData.status !== existing.status) {
      activityData.push({
        action: `Status changed to ${updateData.status}`,
        user: actor,
      });
    }
    if (updateData.priority && updateData.priority !== existing.priority) {
      activityData.push({
        action: `Priority changed to ${updateData.priority}`,
        user: actor,
      });
    }
    if (gatePayload?.phase) {
      activityData.push({
        action: `Phase signed off: ${gatePayload.phase}${gatePayload.note ? ` — ${gatePayload.note}` : ""}`,
        user: actor,
      });
    }
    if (savedLogo) {
      activityData.push({
        action: "Company logo updated",
        user: actor,
      });
    }
    const detailsTouched = [
      "projectName",
      "clientName",
      "clientEmail",
      "clientPhone",
      "companyName",
      "description",
      "services",
      "budget",
      "spent",
      "startDate",
      "deadline",
    ].some((key) => updateData[key] !== undefined);
    if (
      detailsTouched &&
      !activityData.some((a) => a.action.startsWith("Status") || a.action.startsWith("Priority"))
    ) {
      activityData.push({
        action: "Project details updated",
        user: actor,
      });
    }

    const project = await prisma.project.update({
      where: { id: String(id) },
      data: {
        ...updateData,
        activityLogs: activityData.length > 0 ? { create: activityData } : undefined,
      },
      include: projectInclude,
    });

    if (savedLogo && existing.companyLogo && existing.companyLogo !== savedLogo) {
      await removeProjectLogo(existing.companyLogo);
    }

    return NextResponse.json({ project });
  } catch (error) {
    if (savedLogo) await removeProjectLogo(savedLogo);
    console.error("Error updating project:", error);
    const msg = error instanceof Error ? error.message : "Failed to update project";
    const status = /logo|image|MB/i.test(msg) ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

// DELETE project
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const existing = await prisma.project.findUnique({
      where: { id },
      select: { companyLogo: true },
    });
    await prisma.project.delete({ where: { id } });
    if (existing?.companyLogo) await removeProjectLogo(existing.companyLogo);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
