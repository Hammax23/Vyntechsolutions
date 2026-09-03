import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { notSystemStaffWhere, requireStaff } from "@/lib/workflow-auth";
import { publicStaff } from "@/lib/workflow-progress";

export async function GET() {
  const me = await requireStaff();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staffUser.findMany({
    where: { isActive: true, ...notSystemStaffWhere() },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true, isActive: true, color: true },
  });

  return NextResponse.json({ staff: staff.map(publicStaff) });
}
