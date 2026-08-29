import fs from "fs";
import path from "path";

/**
 * Official VynTech mark for print PDFs (black V + cyan dot on transparent/white).
 * Prefer logo-print.png; fall back to logo.png if missing.
 */
export function loadPrintLogoSrc(): string {
  const candidates = ["logo-print.png", "logo.png"];
  for (const file of candidates) {
    const logoPath = path.join(process.cwd(), "public", file);
    if (fs.existsSync(logoPath)) {
      const base64 = fs.readFileSync(logoPath).toString("base64");
      return `data:image/png;base64,${base64}`;
    }
  }
  throw new Error("VynTech print logo not found in /public (logo-print.png / logo.png)");
}
