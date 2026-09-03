import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  clearWorkflowCookie,
  getWorkflowSession,
  setWorkflowCookie,
  verifyPassword,
} from "@/lib/workflow-auth";
import { publicStaff } from "@/lib/workflow-progress";

export async function GET() {
  const session = await getWorkflowSession();
  if (!session) return NextResponse.json({ user: null });
  const staff = await prisma.staffUser.findUnique({ where: { id: session.sub } });
  if (!staff || !staff.isActive) {
    clearWorkflowCookie();
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user: publicStaff(staff) });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const step = body.step as string;

  if (step === "logout") {
    clearWorkflowCookie();
    return NextResponse.json({ success: true });
  }

  if (step !== "login") {
    return NextResponse.json({ error: "Invalid step" }, { status: 400 });
  }

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const staff = await prisma.staffUser.findUnique({ where: { email } });
  if (!staff || !staff.isActive) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const ok = await verifyPassword(password, staff.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await setWorkflowCookie({ sub: staff.id, email: staff.email, name: staff.name });
  return NextResponse.json({ success: true, user: publicStaff(staff) });
}
