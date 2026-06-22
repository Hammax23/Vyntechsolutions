import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";

// Get credentials from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info@vyntechsolutions.ca";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "VynTech@2024";

// Rate limiting settings
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Generate 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIP || "unknown";
}

// Check if IP is locked out
async function isIPLocked(ipAddress: string): Promise<{ locked: boolean; remainingTime?: number }> {
  const fifteenMinutesAgo = new Date(Date.now() - LOCKOUT_DURATION_MS);
  
  const failedAttempts = await prisma.loginAttempt.count({
    where: {
      ipAddress,
      success: false,
      createdAt: { gte: fifteenMinutesAgo },
    },
  });

  if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
    // Get the latest failed attempt to calculate remaining time
    const latestAttempt = await prisma.loginAttempt.findFirst({
      where: {
        ipAddress,
        success: false,
        createdAt: { gte: fifteenMinutesAgo },
      },
      orderBy: { createdAt: "desc" },
    });

    if (latestAttempt) {
      const unlockTime = new Date(latestAttempt.createdAt.getTime() + LOCKOUT_DURATION_MS);
      const remainingTime = Math.ceil((unlockTime.getTime() - Date.now()) / 60000);
      return { locked: true, remainingTime };
    }
  }

  return { locked: false };
}

// Record login attempt
async function recordLoginAttempt(ipAddress: string, email: string, success: boolean) {
  await prisma.loginAttempt.create({
    data: { ipAddress, email, success },
  });

  // Clean up old attempts (older than 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await prisma.loginAttempt.deleteMany({
    where: { createdAt: { lt: oneDayAgo } },
  });
}

// POST - Verify credentials and send 2FA code
export async function POST(request: NextRequest) {
  try {
    const ipAddress = getClientIP(request);
    const { email, password, step, code } = await request.json();

    // Check if IP is locked
    const lockStatus = await isIPLocked(ipAddress);
    if (lockStatus.locked) {
      return NextResponse.json(
        { error: `Too many failed attempts. Try again in ${lockStatus.remainingTime} minutes.` },
        { status: 429 }
      );
    }

    // Step 1: Verify email and password
    if (step === "login") {
      if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        await recordLoginAttempt(ipAddress, email, false);
        
        // Check if this attempt triggered a lockout
        const newLockStatus = await isIPLocked(ipAddress);
        if (newLockStatus.locked) {
          return NextResponse.json(
            { error: `Too many failed attempts. Account locked for 15 minutes.` },
            { status: 429 }
          );
        }
        
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      // Generate 2FA code
      const twoFACode = generateCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

      // Store in database (upsert to handle existing codes)
      await prisma.twoFactorCode.upsert({
        where: { email },
        update: { code: twoFACode, expiresAt },
        create: { email, code: twoFACode, expiresAt },
      });

      // Send email with 2FA code
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.hostinger.com",
        port: parseInt(process.env.SMTP_PORT || "465"),
        secure: true,
        auth: {
          user: process.env.SMTP_USER || "info@vyntechsolutions.ca",
          pass: process.env.SMTP_PASS || "",
        },
      });

      try {
        await transporter.sendMail({
          from: `"VynTech Solutions Admin" <${process.env.SMTP_USER || "info@vyntechsolutions.ca"}>`,
          to: ADMIN_EMAIL,
          subject: "Admin Panel - 2FA Verification Code",
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0055FF 0%, #00B4FF 100%); padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">VynTech Solutions Admin</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0;">Security Verification</p>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Your 2FA verification code is:</p>
              <div style="background: #0055FF; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px;">
                ${twoFACode}
              </div>
              <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
              <p style="color: #999; font-size: 12px; margin-top: 20px;">If you didn't request this code, please ignore this email.</p>
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

      return NextResponse.json({ success: true, message: "2FA code sent to email" });
    }

    // Step 2: Verify 2FA code
    if (step === "verify") {
      const stored = await prisma.twoFactorCode.findUnique({
        where: { email },
      });

      if (!stored) {
        return NextResponse.json({ error: "No verification code found. Please login again." }, { status: 401 });
      }

      if (new Date() > stored.expiresAt) {
        await prisma.twoFactorCode.delete({ where: { email } });
        return NextResponse.json({ error: "Verification code expired. Please login again." }, { status: 401 });
      }

      if (stored.code !== code) {
        await recordLoginAttempt(ipAddress, email, false);
        return NextResponse.json({ error: "Invalid verification code" }, { status: 401 });
      }

      // Clear the code after successful verification
      await prisma.twoFactorCode.delete({ where: { email } });
      
      // Record successful login
      await recordLoginAttempt(ipAddress, email, true);

      // Clear failed attempts for this IP on successful login
      await prisma.loginAttempt.deleteMany({
        where: { ipAddress, success: false },
      });

      return NextResponse.json({ success: true, authenticated: true });
    }

    return NextResponse.json({ error: "Invalid step" }, { status: 400 });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
