/**
 * Dropbox OAuth (refresh-token) helpers for server-side archive uploads.
 * Requires Full Dropbox app scopes: files.content.write, files.content.read, files.metadata.write.
 */

type CachedToken = {
  accessToken: string;
  expiresAt: number;
};

let cachedToken: CachedToken | null = null;

export function isDropboxConfigured(): boolean {
  return Boolean(
    String(process.env.DROPBOX_APP_KEY || "").trim() &&
      String(process.env.DROPBOX_APP_SECRET || "").trim() &&
      String(process.env.DROPBOX_REFRESH_TOKEN || "").trim()
  );
}

export function getDropboxInvoicesRoot(): string {
  const raw = String(
    process.env.DROPBOX_INVOICES_ROOT || "/VynTech Solutions/Client Invoices"
  ).trim();
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return withSlash.replace(/\/+$/, "") || "/VynTech Solutions/Client Invoices";
}

export async function getDropboxAccessToken(): Promise<string> {
  if (!isDropboxConfigured()) {
    throw new Error("Dropbox is not configured");
  }

  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.accessToken;
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: String(process.env.DROPBOX_REFRESH_TOKEN).trim(),
    client_id: String(process.env.DROPBOX_APP_KEY).trim(),
    client_secret: String(process.env.DROPBOX_APP_SECRET).trim(),
  });

  const res = await fetch("https://api.dropboxapi.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    error_description?: string;
    error?: string;
  };

  if (!res.ok || !data.access_token) {
    throw new Error(
      data.error_description || data.error || `Dropbox token refresh failed (${res.status})`
    );
  }

  const expiresIn = typeof data.expires_in === "number" ? data.expires_in : 14400;
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  };
  return data.access_token;
}

export async function dropboxRpc<T = unknown>(
  endpoint: string,
  arg: Record<string, unknown>
): Promise<T> {
  const token = await getDropboxAccessToken();
  const res = await fetch(`https://api.dropboxapi.com/2/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { error_summary: text };
  }

  if (!res.ok) {
    const err = json as { error_summary?: string; error?: { ".tag"?: string } };
    const summary = err?.error_summary || `Dropbox RPC failed (${res.status})`;
    const tag = err?.error?.[".tag"] || "";
    const e = new Error(summary) as Error & { dropboxTag?: string };
    e.dropboxTag = tag;
    throw e;
  }

  return json as T;
}

export async function dropboxUploadFile(opts: {
  path: string;
  contents: Buffer;
  mode?: "overwrite" | "add";
}): Promise<{ pathDisplay: string; pathLower: string }> {
  const token = await getDropboxAccessToken();
  const mode = opts.mode || "overwrite";

  const res = await fetch("https://content.dropboxapi.com/2/files/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
      "Dropbox-API-Arg": JSON.stringify({
        path: opts.path,
        // Dropbox WriteMode union — string form for void members
        mode: mode === "overwrite" ? "overwrite" : "add",
        autorename: false,
        mute: false,
        strict_conflict: false,
      }),
    },
    body: new Uint8Array(opts.contents),
  });

  const data = (await res.json().catch(() => ({}))) as {
    path_display?: string;
    path_lower?: string;
    error_summary?: string;
  };

  if (!res.ok || !data.path_display) {
    throw new Error(data.error_summary || `Dropbox upload failed (${res.status})`);
  }

  return {
    pathDisplay: data.path_display,
    pathLower: data.path_lower || data.path_display.toLowerCase(),
  };
}

/** Create folder; ignore path/conflict if it already exists. */
export async function dropboxEnsureFolder(path: string): Promise<void> {
  try {
    await dropboxRpc("files/create_folder_v2", {
      path,
      autorename: false,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/conflict|already.?exists/i.test(msg)) return;
    const tag = (e as Error & { dropboxTag?: string }).dropboxTag;
    if (tag === "path" || /path\/conflict/i.test(msg)) return;
    throw e;
  }
}

/**
 * Ensure every segment of a Dropbox path exists
 * (e.g. /VynTech Solutions/Client Invoices/2026/11).
 */
export async function dropboxEnsurePathFolders(folderPath: string): Promise<void> {
  const normalized = folderPath.replace(/\\/g, "/").replace(/\/+$/, "");
  if (!normalized || normalized === "/") return;

  const parts = normalized.split("/").filter(Boolean);
  let current = "";
  for (const part of parts) {
    current += `/${part}`;
    await dropboxEnsureFolder(current);
  }
}
