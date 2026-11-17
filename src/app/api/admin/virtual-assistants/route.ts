import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { adminCookieName, verifyAdminSession } from "@/lib/admin-session";
import {
  endOpenSessionsForUser,
  hashAdminPassword,
  isSessionOnline,
  publicAdminUser,
  sessionDurationMs,
  SESSION_TIMEOUT_MS,
} from "@/lib/admin-users";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#";
  let out = "";
  for (let i = 0; i < 12; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

async function requireOwner(request: NextRequest) {
  const token = request.cookies.get(adminCookieName())?.value;
  const payload = await verifyAdminSession(token);
  if (!payload || payload.role !== "owner") return null;
  const user = await prisma.adminUser.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive || user.role !== "owner") return null;
  return { payload, user };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireOwner(request);
    if (!auth) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Close stale sessions before reporting
    const cutoff = new Date(Date.now() - SESSION_TIMEOUT_MS);
    await prisma.adminSession.updateMany({
      where: { logoutAt: null, lastSeenAt: { lt: cutoff } },
      data: { logoutAt: new Date(), endedReason: "timeout" },
    });

    const id = request.nextUrl.searchParams.get("id");
    if (id) {
      const va = await prisma.adminUser.findFirst({
        where: { id, role: "virtual_assistant" },
      });
      if (!va) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const sessions = await prisma.adminSession.findMany({
        where: { userId: va.id },
        orderBy: { loginAt: "desc" },
        take: 50,
      });

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const todaySessions = sessions.filter((s) => s.loginAt >= startOfDay);
      const todayMs = todaySessions.reduce((sum, s) => sum + sessionDurationMs(s), 0);
      const open = sessions.find((s) => !s.logoutAt);

      return NextResponse.json({
        assistant: publicAdminUser(va),
        activity: {
          isOnline: open ? isSessionOnline(open) : false,
          todayMinutes: Math.round(todayMs / 60000),
          sessions: sessions.map((s) => ({
            id: s.id,
            loginAt: s.loginAt.toISOString(),
            lastSeenAt: s.lastSeenAt.toISOString(),
            logoutAt: s.logoutAt ? s.logoutAt.toISOString() : null,
            endedReason: s.endedReason,
            durationMinutes: Math.round(sessionDurationMs(s) / 60000),
            ip: s.ip,
            userAgent: s.userAgent,
            isOnline: isSessionOnline(s),
          })),
        },
      });
    }

    const list = await prisma.adminUser.findMany({
      where: { role: "virtual_assistant" },
      orderBy: { createdAt: "desc" },
      include: {
        sessions: {
          where: { logoutAt: null },
          orderBy: { lastSeenAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      assistants: list.map((u) => ({
        ...publicAdminUser(u),
        isOnline: u.sessions[0] ? isSessionOnline(u.sessions[0]) : false,
        lastSeenAt: u.sessions[0]?.lastSeenAt?.toISOString() || null,
      })),
    });
  } catch (error) {
    console.error("virtual-assistants GET", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOwner(request);
    if (!auth) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password =
      String(body.password || "").trim() || generateTempPassword();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const ownerEmail = String(process.env.ADMIN_EMAIL || "")
      .trim()
      .toLowerCase();
    if (email === ownerEmail) {
      return NextResponse.json(
        { error: "Cannot use the owner admin email for a Virtual Assistant" },
        { status: 400 }
      );
    }

    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An admin user with this email already exists" },
        { status: 409 }
      );
    }

    const va = await prisma.adminUser.create({
      data: {
        name,
        email,
        passwordHash: await hashAdminPassword(password),
        role: "virtual_assistant",
        isActive: true,
      },
    });

    return NextResponse.json({
      assistant: publicAdminUser(va),
      temporaryPassword: password,
    });
  } catch (error) {
    console.error("virtual-assistants POST", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireOwner(request);
    if (!auth) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const id = String(body.id || "").trim();
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const va = await prisma.adminUser.findFirst({
      where: { id, role: "virtual_assistant" },
    });
    if (!va) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data: {
      name?: string;
      isActive?: boolean;
      passwordHash?: string;
    } = {};

    if (body.name != null) {
      const name = String(body.name).trim();
      if (!name) {
        return NextResponse.json({ error: "Name required" }, { status: 400 });
      }
      data.name = name;
    }

    let temporaryPassword: string | undefined;
    if (body.resetPassword === true || body.password) {
      temporaryPassword =
        String(body.password || "").trim() || generateTempPassword();
      if (temporaryPassword.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters" },
          { status: 400 }
        );
      }
      data.passwordHash = await hashAdminPassword(temporaryPassword);
    }

    if (typeof body.isActive === "boolean") {
      data.isActive = body.isActive;
    }

    const updated = await prisma.adminUser.update({
      where: { id },
      data,
    });

    if (data.isActive === false) {
      await endOpenSessionsForUser(id, "disabled");
    }

    return NextResponse.json({
      assistant: publicAdminUser(updated),
      ...(temporaryPassword ? { temporaryPassword } : {}),
    });
  } catch (error) {
    console.error("virtual-assistants PATCH", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
