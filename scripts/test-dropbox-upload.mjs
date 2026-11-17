import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getAccessToken() {
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
  if (!res.ok || !data.access_token) {
    throw new Error(`Token failed: ${JSON.stringify(data)}`);
  }
  console.log("OK: Dropbox access token refreshed");
  return data.access_token;
}

async function uploadTestPdf(token) {
  const root = (process.env.DROPBOX_INVOICES_ROOT || "/Invoices").replace(/\/+$/, "");
  const path = `${root}/_connection-test.txt`;
  const contents = `VynTech Dropbox connection test\n${new Date().toISOString()}\n`;

  // ensure /Invoices folder
  for (const folder of [root]) {
    const create = await fetch("https://api.dropboxapi.com/2/files/create_folder_v2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: folder, autorename: false }),
    });
    const created = await create.json().catch(() => ({}));
    if (!create.ok && !String(created.error_summary || "").includes("conflict")) {
      console.log("create_folder:", created);
    } else {
      console.log("OK: folder ready", folder);
    }
  }

  const res = await fetch("https://content.dropboxapi.com/2/files/upload", {
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
    body: contents,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Upload failed: ${JSON.stringify(data)}`);
  console.log("OK: uploaded", data.path_display || path);
  return data.path_display || path;
}

async function tryPaidInvoiceUpload() {
  const paid = await prisma.billingInvoice.findFirst({
    where: { status: "paid", deletedAt: null },
    orderBy: { paidAt: "desc" },
    select: {
      id: true,
      invoiceNumber: true,
      dropboxPath: true,
      dropboxError: true,
    },
  });
  if (!paid) {
    console.log("INFO: no paid invoice in DB — connection test file only");
    return null;
  }
  console.log("Found paid invoice:", paid.invoiceNumber, paid.id);

  // Dynamic import of TS path won't work in plain mjs easily — call via fetch if server up
  const base = process.env.TEST_BASE || "http://127.0.0.1:3000";
  try {
    const res = await fetch(`${base}/api/admin/billing-invoices/dropbox`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: paid.id }),
    });
    const data = await res.json().catch(() => ({}));
    console.log("Invoice upload API status:", res.status, data.error || data.path || data);
    return data;
  } catch (e) {
    console.log("INFO: admin API not reachable (dev server / auth). Connection file test still valid.");
    console.log(String(e.message || e));
    return null;
  }
}

const token = await getAccessToken();
await uploadTestPdf(token);
await tryPaidInvoiceUpload();
await prisma.$disconnect();
console.log("\nDropbox test finished.");
