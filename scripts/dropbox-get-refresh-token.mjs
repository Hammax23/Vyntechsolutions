/**
 * One-time helper: exchange a Dropbox OAuth authorization code for a refresh token.
 *
 * Redirect URI must match Dropbox App Console → OAuth 2 → Redirect URIs exactly.
 * Default (local): http://localhost:3000
 *
 * 1. Add Redirect URIs in Dropbox:
 *    - http://localhost:3000
 *    - https://vyntechsolutions.ca
 *    - https://www.vyntechsolutions.ca
 * 2. Open:
 *    https://www.dropbox.com/oauth2/authorize?client_id=APP_KEY&response_type=code&token_access_type=offline&redirect_uri=http://localhost:3000
 * 3. Allow → browser goes to http://localhost:3000/?code=XXXX (page may fail to load — OK)
 * 4. Copy code from address bar
 * 5. Run:
 *    node scripts/dropbox-get-refresh-token.mjs <APP_KEY> <APP_SECRET> <AUTH_CODE>
 *    optional 4th arg: redirect URI (default http://localhost:3000)
 */

const [appKey, appSecret, code, redirectUriArg] = process.argv.slice(2);
const redirectUri = redirectUriArg || "http://localhost:3000";

if (!appKey || !appSecret || !code) {
  console.error(
    "Usage: node scripts/dropbox-get-refresh-token.mjs <APP_KEY> <APP_SECRET> <AUTH_CODE> [REDIRECT_URI]"
  );
  process.exit(1);
}

const body = new URLSearchParams({
  code,
  grant_type: "authorization_code",
  client_id: appKey,
  client_secret: appSecret,
  redirect_uri: redirectUri,
});

const res = await fetch("https://api.dropboxapi.com/oauth2/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body,
});

const data = await res.json();
if (!res.ok) {
  console.error("Failed:", data);
  process.exit(1);
}

console.log("\nAdd these to .env:\n");
console.log(`DROPBOX_APP_KEY="${appKey}"`);
console.log(`DROPBOX_APP_SECRET="${appSecret}"`);
console.log(`DROPBOX_REFRESH_TOKEN="${data.refresh_token || ""}"`);
if (!data.refresh_token) {
  console.warn(
    "\nNo refresh_token returned. Re-authorize with token_access_type=offline."
  );
}
