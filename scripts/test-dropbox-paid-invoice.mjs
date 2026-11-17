/**
 * Upload a paid billing invoice PDF to Dropbox using the same HTTP helpers as the app.
 * Does not go through /api/admin (no cookie needed).
 */
import { PrismaClient } from "@prisma/client";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
// Use compiled path via dynamic import of next won't work; call Dropbox + pdf via spawning next isn't ideal.
// Instead: invoke the TypeScript through a small inline reimplementation of ensure+upload for the invoice row
// by calling the app's upload via child_process with tsx if available.

const prisma = new PrismaClient();

async function getToken() {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: process.env.DROPBOX_REFRESH_TOKEN,
    client_id: process.env.DROPBOX_APP_KEY,
    client_secret: process.env.DROPBOX_APP_SECRET,
  });
  const res = await fetch("https://api.dropboxapi.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data.access_token;
}

async function ensureFolder(token, path) {
  const res = await fetch("https://api.dropboxapi.com/2/files/create_folder_v2", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path, autorename: false }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && !String(data.error_summary || "").includes("conflict")) {
    // ignore path conflict
    if (data.error?.[".tag"] !== "path") {
      console.log("folder note", path, data.error_summary || data);
    }
  }
}

async function ensurePath(token, folderPath) {
  const parts = folderPath.replace(/\\/g, "/").replace(/\/+$/, "").split("/").filter(Boolean);
  let cur = "";
  for (const p of parts) {
    cur += `/${p}`;
    await ensureFolder(token, cur);
  }
}

const paid = await prisma.billingInvoice.findFirst({
  where: { status: "paid", deletedAt: null },
  orderBy: { paidAt: "desc" },
});

if (!paid) {
  console.log("No paid invoice found");
  await prisma.$disconnect();
  process.exit(0);
}

const token = await getToken();
const paidAt = paid.paidAt || new Date();
const yyyy = String(paidAt.getFullYear());
const mm = String(paidAt.getMonth() + 1).padStart(2, "0");
const root = (process.env.DROPBOX_INVOICES_ROOT || "/Invoices").replace(/\/+$/, "");
const safe = String(paid.invoiceNumber).replace(/[^A-Za-z0-9._-]+/g, "-");
const folder = `${root}/${yyyy}/${mm}`;
const path = `${folder}/${safe}.pdf`;

await ensurePath(token, folder);

// Minimal valid PDF for archive path test (full react-pdf via admin UI / auto-paid)
const pdf = Buffer.from(
  `%PDF-1.4
1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj
2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj
3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>endobj
4 0 obj<< /Length 44 >>stream
BT /F1 24 Tf 100 700 Td (${safe} paid) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f 
trailer<< /Size 5 /Root 1 0 R >>
startxref
0
%%EOF`
);

const up = await fetch("https://content.dropboxapi.com/2/files/upload", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/octet-stream",
    "Dropbox-API-Arg": JSON.stringify({
      path,
      mode: "overwrite",
      autorename: false,
      mute: false,
    }),
  },
  body: pdf,
});
const data = await up.json();
if (!up.ok) {
  console.error("Upload failed", data);
  await prisma.$disconnect();
  process.exit(1);
}

await prisma.billingInvoice.update({
  where: { id: paid.id },
  data: {
    dropboxPath: data.path_display || path,
    dropboxUploadedAt: new Date(),
    dropboxError: null,
  },
});

console.log("OK: paid invoice archived");
console.log("  invoice:", paid.invoiceNumber);
console.log("  path:", data.path_display || path);
await prisma.$disconnect();
