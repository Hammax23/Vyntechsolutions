import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";
import {
  adminCookieMaxAge,
  adminCookieName,
  adminCookieOptions,
  signAdminSession,
  verifyAdminSession,
  type AdminRole,
} from "@/lib/admin-session";
import {
  ensureOwnerAdminUser,
  publicAdminUser,
  verifyAdminPassword,
} from "@/lib/admin-users";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIP || "unknown";
}

async function isIPLocked(
  ipAddress: string
): Promise<{ locked: boolean; remainingTime?: number }> {
  const fifteenMinutesAgo = new Date(Date.now() - LOCKOUT_DURATION_MS);
  const failedAttempts = await prisma.loginAttempt.count({
    where: {
      ipAddress,
      success: false,
      createdAt: { gte: fifteenMinutesAgo },
    },
  });

  if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
    const latestAttempt = await prisma.loginAttempt.findFirst({
      where: {
        ipAddress,
        success: false,
        createdAt: { gte: fifteenMinutesAgo },
      },
      orderBy: { createdAt: "desc" },
    });
    if (latestAttempt) {
      const unlockTime = new Date(
        latestAttempt.createdAt.getTime() + LOCKOUT_DURATION_MS
      );
      const remainingTime = Math.ceil((unlockTime.getTime() - Date.now()) / 60000);
      return { locked: true, remainingTime };
    }
  }
  return { locked: false };
}

async function recordLoginAttempt(
  ipAddress: string,
  email: string,
  success: boolean
) {
  await prisma.loginAttempt.create({
    data: { ipAddress, email, success },
  });
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await prisma.loginAttempt.deleteMany({
    where: { createdAt: { lt: oneDayAgo } },
  });
}

function clearAdminCookie(res: NextResponse) {
  res.cookies.set(adminCookieName(), "", {
    ...adminCookieOptions(),
    maxAge: 0,
  });
}

export async function GET(request: NextRequest) {
  try {
    await ensureOwnerAdminUser();
    const token = request.cookies.get(adminCookieName())?.value;
    const session = await verifyAdminSession(token);
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await prisma.adminUser.findUnique({ where: { id: session.sub } });
    if (!user || !user.isActive) {
      if (session.sid) {
        await prisma.adminSession.updateMany({
          where: { id: session.sid, logoutAt: null },
          data: {
            logoutAt: new Date(),
            endedReason: user ? "disabled" : "logout",
            lastSeenAt: new Date(),
          },
        });
      }
      const res = NextResponse.json({ authenticated: false }, { status: 401 });
      clearAdminCookie(res);
      return res;
    }

    return NextResponse.json({
      authenticated: true,
      user: publicAdminUser(user),
      sessionId: session.sid,
    });
  } catch (error) {
    console.error("admin auth me", error);
    return NextResponse.json({ error: "Auth check failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureOwnerAdminUser();
    const ipAddress = getClientIP(request);
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");
    const step = String(body.step || "").trim();
    const code = String(body.code || "").trim();

    if (step === "logout") {
      const token = request.cookies.get(adminCookieName())?.value;
      const session = await verifyAdminSession(token);
      if (session?.sid) {
        await prisma.adminSession.updateMany({
          where: { id: session.sid, logoutAt: null },
          data: {
            logoutAt: new Date(),
            endedReason: "logout",
            lastSeenAt: new Date(),
          },
        });
      }
      const res = NextResponse.json({ success: true });
      clearAdminCookie(res);
      return res;
    }

    if (step === "me") {
      // Prefer GET; keep POST for compatibility
      return GET(request);
    }

    const lockStatus = await isIPLocked(ipAddress);
    if (lockStatus.locked) {
      return NextResponse.json(
        {
          error: `Too many failed attempts. Try again in ${lockStatus.remainingTime} minutes.`,
        },
        { status: 429 }
      );
    }

    if (step === "login") {
      const user = await prisma.adminUser.findUnique({ where: { email } });
      const ok =
        user &&
        user.isActive &&
        (await verifyAdminPassword(password, user.passwordHash));

      if (!ok) {
        await recordLoginAttempt(ipAddress, email || "unknown", false);
        const newLockStatus = await isIPLocked(ipAddress);
        if (newLockStatus.locked) {
          return NextResponse.json(
            { error: "Too many failed attempts. Account locked for 15 minutes." },
            { status: 429 }
          );
        }
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const twoFACode = generateCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await prisma.twoFactorCode.upsert({
        where: { email },
        update: { code: twoFACode, expiresAt },
        create: { email, code: twoFACode, expiresAt },
      });

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.hostinger.com",
        port: parseInt(process.env.SMTP_PORT || "465", 10),
        secure: true,
        auth: {
          user: process.env.SMTP_USER || "info@vyntechsolutions.ca",
          pass: process.env.SMTP_PASS || "",
        },
      });

      try {
        await transporter.sendMail({
          from: `"VynTech Solutions Admin" <${process.env.SMTP_USER || "info@vyntechsolutions.ca"}>`,
          to: email,
          subject: "Admin Panel - 2FA Verification Code",
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0055FF 0%, #00B4FF 100%); padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">VynTech Solutions Admin</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0;">Security Verification</p>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Hello ${user!.name}, your 2FA code is:</p>
              <div style="background: #0055FF; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px;">
                ${twoFACode}
              </div>
              <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
            </div>
          </div>
        `,
        });
      } catch (smtpError) {
        console.error("SMTP error:", smtpError);
        if (process.env.NODE_ENV !== "production") {
          console.log(`[DEV] Admin 2FA code for ${email}: ${twoFACode}`);
          return NextResponse.json({
            success: true,
            message: "2FA code generated (check server console in development)",
            devCode: twoFACode,
          });
        }
        throw smtpError;
      }

      return NextResponse.json({
        success: true,
        message: "2FA code sent to email",
      });
    }

    if (step === "verify") {
      const stored = await prisma.twoFactorCode.findUnique({ where: { email } });
      if (!stored) {
        return NextResponse.json(
          { error: "No verification code found. Please login again." },
          { status: 401 }
        );
      }
      if (new Date() > stored.expiresAt) {
        await prisma.twoFactorCode.delete({ where: { email } });
        return NextResponse.json(
          { error: "Verification code expired. Please login again." },
          { status: 401 }
        );
      }
      if (stored.code !== code) {
        await recordLoginAttempt(ipAddress, email, false);
        return NextResponse.json(
          { error: "Invalid verification code" },
          { status: 401 }
        );
      }

      await prisma.twoFactorCode.delete({ where: { email } });

      const user = await prisma.adminUser.findUnique({ where: { email } });
      if (!user || !user.isActive) {
        return NextResponse.json(
          { error: "Account not found or inactive" },
          { status: 401 }
        );
      }

      const role = (
        user.role === "owner" ? "owner" : "virtual_assistant"
      ) as AdminRole;

      const dbSession = await prisma.adminSession.create({
        data: {
          userId: user.id,
          ip: ipAddress,
          userAgent: request.headers.get("user-agent") || null,
        },
      });

      await prisma.adminUser.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      await recordLoginAttempt(ipAddress, email, true);
      await prisma.loginAttempt.deleteMany({
        where: { ipAddress, success: false },
      });

      const token = await signAdminSession({
        sub: user.id,
        email: user.email,
        name: user.name,
        role,
        sid: dbSession.id,
      });

      const res = NextResponse.json({
        success: true,
        authenticated: true,
        user: publicAdminUser(user),
        sessionId: dbSession.id,
      });
      res.cookies.set(adminCookieName(), token, {
        ...adminCookieOptions(),
        maxAge: adminCookieMaxAge(),
      });
      return res;
    }

    return NextResponse.json({ error: "Invalid step" }, { status: 400 });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
