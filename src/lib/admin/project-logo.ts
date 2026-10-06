import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";

export const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2 MB
export const LOGO_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
]);

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "project-logos");
const PUBLIC_PREFIX = "/uploads/project-logos";

function extensionOf(fileName: string, mimeType: string): string {
  const fromName = path.extname(fileName || "").toLowerCase();
  if (fromName && /^\.[a-z0-9]+$/i.test(fromName) && fromName.length <= 8) {
    return fromName;
  }
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "image/gif") return ".gif";
  if (mimeType === "image/svg+xml") return ".svg";
  return ".jpg";
}

export async function saveProjectLogo(file: File): Promise<string> {
  if (!(file instanceof File) || file.size <= 0) {
    throw new Error("Choose a logo image");
  }
  if (file.size > MAX_LOGO_BYTES) {
    throw new Error("Logo must be 2 MB or smaller");
  }
  const mime = (file.type || "").toLowerCase();
  if (mime && !LOGO_MIME.has(mime)) {
    throw new Error("Logo must be PNG, JPG, WebP, GIF, or SVG");
  }

  await fs.mkdir(UPLOAD_ROOT, { recursive: true });
  const ext = extensionOf(file.name || "logo", mime);
  const stored = `${Date.now().toString(36)}_${randomBytes(6).toString("hex")}${ext}`;
  const dest = path.join(UPLOAD_ROOT, stored);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(dest, buffer);
  return `${PUBLIC_PREFIX}/${stored}`;
}

export async function removeProjectLogo(publicPath: string | null | undefined) {
  if (!publicPath || !publicPath.startsWith(PUBLIC_PREFIX + "/")) return;
  const base = path.basename(publicPath);
  if (!base || base.includes("..")) return;
  await fs.unlink(path.join(UPLOAD_ROOT, base)).catch(() => null);
}
