import { NextRequest, NextResponse } from "next/server";
import { verifyWorkflowSession, workflowCookieName } from "@/lib/workflow-session";
import {
  fetchActiveUrlRedirects,
  findMatchingRedirect,
  resolveRedirectDestination,
  shouldSkipRedirectLookup,
} from "@/lib/cms/redirects";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!shouldSkipRedirectLookup(pathname)) {
    try {
      const redirects = await fetchActiveUrlRedirects();
      const match = findMatchingRedirect(pathname, redirects);
      if (match) {
        const destination = resolveRedirectDestination(match.toUrl, request.nextUrl);
        const status = match.redirectType === "temporary" ? 302 : 301;
        return NextResponse.redirect(destination, status);
      }
    } catch {
      /* Strapi offline — continue without redirect */
    }
  }

  if (pathname.startsWith("/api/workflow/auth")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/workflow")) {
    const token = request.cookies.get(workflowCookieName())?.value;
    const session = await verifyWorkflowSession(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match page paths + workflow API auth.
     * Skip Next internals and common static assets.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff2?)$).*)",
  ],
};
