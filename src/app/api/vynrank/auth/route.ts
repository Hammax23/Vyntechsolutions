import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  signVynRankSession,
  verifyVynRankSession,
  vynrankCookieName,
  vynrankCookieOptions,
  isVynRankRole,
} from "@/lib/vynrank/session";
import {
  findActiveVynRankUserByEmail,
  publicVynRankUser,
  verifyVynRankPassword,
} from "@/lib/vynrank/users";
import { defaultPathForRole, navKeysForRole, roleLabel } from "@/lib/vynrank/acl";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function clearCookie(res: NextResponse) {
  res.cookies.set(vynrankCookieName(), "", {
    ...vynrankCookieOptions(),
    maxAge: 0,
  });
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(vynrankCookieName())?.value;
    const session = await verifyVynRankSession(token);
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await prisma.vynRankUser.findUnique({ where: { id: session.sub } });
    if (!user || !user.isActive || !isVynRankRole(user.role)) {
      const res = NextResponse.json({ authenticated: false }, { status: 401 });
      clearCookie(res);
      return res;
    }

    return NextResponse.json({
      authenticated: true,
      user: publicVynRankUser(user),
      roleLabel: roleLabel(user.role as "ceo" | "seo_team" | "client"),
      navKeys: navKeysForRole(user.role as "ceo" | "seo_team" | "client"),
      defaultPath: defaultPathForRole(user.role as "ceo" | "seo_team" | "client"),
    });
  } catch (error) {
    console.error("vynrank auth me", error);
    return NextResponse.json({ error: "Auth check failed" }, { status: 500 });
  }
}

async function issueSessionForUser(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  orgId: string;
  isActive: boolean;
}) {
  if (!user.isActive || !isVynRankRole(user.role)) {
    return NextResponse.json({ error: "Account role is invalid" }, { status: 403 });
  }
  const token = await signVynRankSession({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    orgId: user.orgId,
  });
  const res = NextResponse.json({
    authenticated: true,
    user: publicVynRankUser(user),
    roleLabel: roleLabel(user.role),
    navKeys: navKeysForRole(user.role),
    defaultPath: defaultPathForRole(user.role),
  });
  res.cookies.set(vynrankCookieName(), token, vynrankCookieOptions());
  return res;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
      action?: string;
    };

    if (body.action === "logout") {
      const res = NextResponse.json({ ok: true });
      clearCookie(res);
      return res;
    }

    const email = String(body.email || "").trim().toLowerCase();

    // Figma prototype chips + magic-link CTA (demo seeded @vynrank.local only)
    if (body.action === "demo" || body.action === "magic") {
      if (!email.endsWith("@vynrank.local")) {
        return NextResponse.json(
          { error: "Sign-in link is available for workspace demo accounts only." },
          { status: 400 }
        );
      }
      const user = await findActiveVynRankUserByEmail(email);
      if (!user) {
        return NextResponse.json({ error: "No account found for that email" }, { status: 404 });
      }
      return issueSessionForUser(user);
    }

    const password = String(body.password || "");
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await findActiveVynRankUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const ok = await verifyVynRankPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    return issueSessionForUser(user);
  } catch (error) {
    console.error("vynrank auth login", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  clearCookie(res);
  return res;
}
