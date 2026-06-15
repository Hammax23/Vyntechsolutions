import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";
import {
  SEO_EXPERT_EMAIL,
  SEO_EXPERT_PASSWORD,
  createSeoSession,
  generate2FACode,
  getClientIP,
  isSeoIPLocked,
  recordSeoLoginAttempt,
} from "@/lib/seopanel/auth";

export async function POST(request: NextRequest) {
  try {
    const ipAddress = getClientIP(request);
    const { email, password, step, code } = await request.json();

    const lockStatus = await isSeoIPLocked(ipAddress);
    if (lockStatus.locked) {
      return NextResponse.json(
        { error: `Too many failed attempts. Try again in ${lockStatus.remainingTime} minutes.` },
        { status: 429 }
      );
    }

    if (step === "login") {
      if (email !== SEO_EXPERT_EMAIL || password !== SEO_EXPERT_PASSWORD) {
        await recordSeoLoginAttempt(ipAddress, email, false);
        const newLock = await isSeoIPLocked(ipAddress);
        if (newLock.locked) {
          return NextResponse.json({ error: "Too many failed attempts. Account locked for 15 minutes." }, { status: 429 });
        }
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      const twoFACode = generate2FACode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      const seo2faEmail = `seo:${email}`;

      await prisma.twoFactorCode.upsert({
        where: { email: seo2faEmail },
        update: { code: twoFACode, expiresAt },
        create: { email: seo2faEmail, code: twoFACode, expiresAt },
      });

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.hostinger.com",
        port: parseInt(process.env.SMTP_PORT || "465"),
        secure: true,
        auth: {
          user: process.env.SMTP_USER || "info@weborbitztech.ca",
          pass: process.env.SMTP_PASS || "",
        },
      });

      await transporter.sendMail({
        from: `"WebOrbitz SEO Panel" <${process.env.SMTP_USER || "info@weborbitztech.ca"}>`,
        to: SEO_EXPERT_EMAIL,
        subject: "SEO Panel - 2FA Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0d9488 0%, #0055FF 100%); padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">WebOrbitz SEO Panel</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0;">Expert Access Verification</p>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Your verification code:</p>
              <div style="background: #0d9488; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; text-align: center; border-radius: 8px;">${twoFACode}</div>
              <p style="color: #666; font-size: 14px; margin-top: 20px;">Expires in 10 minutes.</p>
            </div>
          </div>
        `,
      });

      return NextResponse.json({ success: true, message: "2FA code sent to email" });
    }

    if (step === "verify") {
      const seo2faEmail = `seo:${email}`;
      const stored = await prisma.twoFactorCode.findUnique({ where: { email: seo2faEmail } });

      if (!stored) {
        return NextResponse.json({ error: "No verification code found. Please login again." }, { status: 401 });
      }
      if (new Date() > stored.expiresAt) {
        await prisma.twoFactorCode.delete({ where: { email: seo2faEmail } });
        return NextResponse.json({ error: "Verification code expired." }, { status: 401 });
      }
      if (stored.code !== code) {
        await recordSeoLoginAttempt(ipAddress, email, false);
        return NextResponse.json({ error: "Invalid verification code" }, { status: 401 });
      }

      await prisma.twoFactorCode.delete({ where: { email: seo2faEmail } });
      await recordSeoLoginAttempt(ipAddress, email, true);
      await prisma.loginAttempt.deleteMany({ where: { ipAddress, success: false } });

      const session = await createSeoSession(email);
      return NextResponse.json({ success: true, authenticated: true, token: session.token, expiresAt: session.expiresAt });
    }

    if (step === "logout") {
      const authHeader = request.headers.get("authorization");
      const token = authHeader?.replace("Bearer ", "");
      if (token) {
        await prisma.seoSession.deleteMany({ where: { token } });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid step" }, { status: 400 });
  } catch (error) {
    console.error("SEO auth error:", error);
    const msg = error instanceof Error && error.message.includes("database")
      ? "Database connection failed. Ensure PostgreSQL is running."
      : "Authentication failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
