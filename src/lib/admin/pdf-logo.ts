import fs from "fs";
import path from "path";

/**
 * Official VynTech mark for print PDFs (black V + cyan dot on transparent/white).
 * Prefer logo-print.png; fall back to logo.png if missing.
 */
export const PRINT_LOGO_CID = "vyntech-logo@vyntech";

function resolvePrintLogoPath(): string {
  const candidates = ["logo-print.png", "logo.png"];
  for (const file of candidates) {
    const logoPath = path.join(process.cwd(), "public", file);
    if (fs.existsSync(logoPath)) return logoPath;
  }
  throw new Error("VynTech print logo not found in /public (logo-print.png / logo.png)");
}

export function loadPrintLogoSrc(): string {
  const logoPath = resolvePrintLogoPath();
  const base64 = fs.readFileSync(logoPath).toString("base64");
  return `data:image/png;base64,${base64}`;
}

/** Buffer + filename for email inline (CID) attachments — works offline / localhost. */
export function loadPrintLogoAttachment(): {
  filename: string;
  content: Buffer;
  contentType: string;
  cid: string;
  contentDisposition: "inline";
} {
  const logoPath = resolvePrintLogoPath();
  return {
    filename: path.basename(logoPath),
    content: fs.readFileSync(logoPath),
    contentType: "image/png",
    cid: PRINT_LOGO_CID,
    contentDisposition: "inline",
  };
}
