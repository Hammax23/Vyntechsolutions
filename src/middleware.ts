import { NextRequest, NextResponse } from "next/server";
import { verifyWorkflowSession, workflowCookieName } from "@/lib/workflow-session";
import { adminCookieName, verifyAdminSession } from "@/lib/admin-session";
import { canAccessAdminApi } from "@/lib/admin-acl";
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

  // /api/admin/auth is public (login/verify/me/logout self-enforce)
  const adminPath = pathname.replace(/\/+$/, "") || pathname;
  if (adminPath === "/api/admin/auth" || adminPath.startsWith("/api/admin/auth/")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    const token = request.cookies.get(adminCookieName())?.value;
    const session = await verifyAdminSession(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canAccessAdminApi(session.role, request.method, pathname)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff2?)$).*)",
  ],
};
