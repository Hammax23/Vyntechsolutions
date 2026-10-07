import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

export class MailError extends Error {
  code: "SMTP_FAILED" | "SMTP_CONFIG";
  constructor(code: MailError["code"], message: string) {
    super(message);
    this.code = code;
    this.name = "MailError";
  }
}

function smtpConfig(): SMTPTransport.Options {
  const host = process.env.SMTP_HOST || "smtp.hostinger.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  return {
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  };
}

export function getMailFromAddress(): string {
  return process.env.SMTP_USER || "info@vyntechsolutions.ca";
}

export function getArchiveBccAddress(): string {
  return (
    String(process.env.CLIENT_UPDATE_BCC || "").trim() ||
    "info@vyntechsolutions.ca" ||
    getMailFromAddress()
  );
}

/** Prefer ADMIN_EMAIL for "send test to me". */
export function getAdminTestAddress(): string {
  return (
    String(process.env.ADMIN_EMAIL || "").trim() ||
    getMailFromAddress()
  );
}

let cachedTransport: nodemailer.Transporter | null = null;

export function getMailTransport() {
  if (!cachedTransport) {
    cachedTransport = nodemailer.createTransport(smtpConfig());
  }
  return cachedTransport;
}

function normalizeEmail(addr: string): string {
  return String(addr || "").trim().toLowerCase();
}

export function isValidEmail(addr: string): boolean {
  const s = String(addr || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  bcc?: string | null;
  replyTo?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
    /** Inline image: use matching cid:… in HTML src */
    cid?: string;
    contentDisposition?: "inline" | "attachment";
  }>;
}): Promise<{ messageId?: string }> {
  const to = String(opts.to || "").trim();
  if (!isValidEmail(to)) {
    throw new MailError("SMTP_CONFIG", "Invalid recipient email address");
  }

  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  if (!user || !pass) {
    throw new MailError("SMTP_CONFIG", "Email is not configured (SMTP_USER / SMTP_PASS)");
  }

  let bcc = opts.bcc ? String(opts.bcc).trim() : undefined;
  if (bcc && normalizeEmail(bcc) === normalizeEmail(to)) {
    bcc = undefined;
  }

  try {
    const info = await getMailTransport().sendMail({
      from: `"VynTech Solutions" <${user}>`,
      to,
      bcc: bcc || undefined,
      replyTo: opts.replyTo || "info@vyntechsolutions.ca",
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      attachments: opts.attachments,
    });
    return { messageId: info.messageId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Email could not be sent";
    throw new MailError("SMTP_FAILED", msg);
  }
}

export async function verifyMailer(): Promise<boolean> {
  try {
    await getMailTransport().verify();
    return true;
  } catch {
    return false;
  }
}
