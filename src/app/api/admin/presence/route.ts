import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { adminCookieName, verifyAdminSession } from "@/lib/admin-session";
import {
  SESSION_TIMEOUT_MS,
  isSessionOnline,
  sessionDurationMs,
} from "@/lib/admin-users";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function requireSession(request: NextRequest) {
  const token = request.cookies.get(adminCookieName())?.value;
  const payload = await verifyAdminSession(token);
  if (!payload) return null;

  const user = await prisma.adminUser.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) {
    if (payload.sid) {
      await prisma.adminSession.updateMany({
        where: { id: payload.sid, logoutAt: null },
        data: {
          logoutAt: new Date(),
          endedReason: "disabled",
          lastSeenAt: new Date(),
        },
      });
    }
    return null;
  }
  return { payload, user };
}

/** Heartbeat — updates lastSeenAt for the current admin session. */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireSession(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = auth;
    const session = await prisma.adminSession.findUnique({
      where: { id: payload.sid },
    });
    if (!session || session.userId !== payload.sub) {
      return NextResponse.json({ error: "Session not found" }, { status: 401 });
    }
    if (session.logoutAt) {
      return NextResponse.json({ error: "Session ended" }, { status: 401 });
    }

    const now = new Date();
    const staleMs = now.getTime() - session.lastSeenAt.getTime();
    if (staleMs > SESSION_TIMEOUT_MS) {
      await prisma.adminSession.update({
        where: { id: session.id },
        data: {
          logoutAt: now,
          endedReason: "timeout",
          lastSeenAt: now,
        },
      });
      return NextResponse.json({ error: "Session timed out" }, { status: 401 });
    }

    const updated = await prisma.adminSession.update({
      where: { id: session.id },
      data: { lastSeenAt: now },
    });

    return NextResponse.json({
      ok: true,
      online: isSessionOnline(updated),
      lastSeenAt: updated.lastSeenAt.toISOString(),
      durationMs: sessionDurationMs(updated),
    });
  } catch (error) {
    console.error("admin presence", error);
    return NextResponse.json({ error: "Presence update failed" }, { status: 500 });
  }
}

/** Owner: close stale open sessions (optional maintenance). */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireSession(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cutoff = new Date(Date.now() - SESSION_TIMEOUT_MS);
    await prisma.adminSession.updateMany({
      where: {
        logoutAt: null,
        lastSeenAt: { lt: cutoff },
      },
      data: {
        logoutAt: new Date(),
        endedReason: "timeout",
      },
    });

    if (auth.user.role !== "owner") {
      return NextResponse.json({ ok: true });
    }

    const vas = await prisma.adminUser.findMany({
      where: { role: "virtual_assistant" },
      orderBy: { name: "asc" },
      include: {
        sessions: {
          where: { logoutAt: null },
          orderBy: { lastSeenAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      online: vas.map((u) => ({
        userId: u.id,
        name: u.name,
        email: u.email,
        isOnline: u.sessions[0] ? isSessionOnline(u.sessions[0]) : false,
        lastSeenAt: u.sessions[0]?.lastSeenAt?.toISOString() || null,
      })),
    });
  } catch (error) {
    console.error("admin presence GET", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
