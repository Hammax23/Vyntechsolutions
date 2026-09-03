import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  ADMIN_WORKFLOW_CREATOR_EMAIL,
  hashPassword,
  isSystemStaffRecord,
  nextStaffColor,
  notSystemStaffWhere,
} from "@/lib/workflow-auth";
import { publicStaff } from "@/lib/workflow-progress";

export const dynamic = "force-dynamic";

function serialize(staff: {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  color: string;
  createdAt: Date;
}) {
  return { ...publicStaff(staff), createdAt: staff.createdAt.toISOString() };
}

export async function GET() {
  try {
    const staff = await prisma.staffUser.findMany({
      where: notSystemStaffWhere(),
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ staff: staff.map(serialize) });
  } catch (error) {
    console.error("staff GET", error);
    return NextResponse.json({ error: "Failed to load staff" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const role = "employee";

    if (!name || !email || password.length < 6) {
      return NextResponse.json(
        { error: "Name, email, and password (6+ characters) are required" },
        { status: 400 }
      );
    }
    if (email === ADMIN_WORKFLOW_CREATOR_EMAIL) {
      return NextResponse.json({ error: "Reserved email" }, { status: 400 });
    }

    const count = await prisma.staffUser.count({ where: notSystemStaffWhere() });
    const staff = await prisma.staffUser.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        role,
        color: nextStaffColor(count),
      },
    });
    return NextResponse.json({ staff: serialize(staff) });
  } catch (error: unknown) {
    const code = error && typeof error === "object" && "code" in error ? (error as { code: string }).code : "";
    if (code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    console.error("staff POST", error);
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const id = String(body.id || "");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const existing = await prisma.staffUser.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (isSystemStaffRecord(existing)) {
      return NextResponse.json({ error: "System account cannot be edited" }, { status: 403 });
    }

    const data: {
      name?: string;
      isActive?: boolean;
      passwordHash?: string;
    } = {};

    if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
    if (typeof body.isActive === "boolean") data.isActive = body.isActive;
    if (typeof body.password === "string" && body.password.length >= 6) {
      data.passwordHash = await hashPassword(body.password);
    }

    const staff = await prisma.staffUser.update({ where: { id }, data });
    return NextResponse.json({ staff: serialize(staff) });
  } catch (error) {
    console.error("staff PATCH", error);
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });

  }
}
