import { NextRequest, NextResponse } from "next/server";
import { verifyWorkflowSession, workflowCookieName } from "@/lib/workflow-session";
import { adminCookieName, verifyAdminSession } from "@/lib/admin-session";
import { canAccessAdminApi } from "@/lib/admin-acl";
import {
  verifyVynRankSession,
  vynrankCookieName,
} from "@/lib/vynrank/session";
import {
  canAccessVynRankPath,
  defaultPathForRole,
} from "@/lib/vynrank/acl";
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

  // /api/vynrank/auth is public
  const vynApi = pathname.replace(/\/+$/, "") || pathname;
  if (vynApi === "/api/vynrank/auth" || vynApi.startsWith("/api/vynrank/auth/")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/vynrank")) {
    const token = request.cookies.get(vynrankCookieName())?.value;
    const session = await verifyVynRankSession(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Protect /vynrank pages (except login)
  if (pathname.startsWith("/vynrank")) {
    const isLogin = pathname === "/vynrank/login" || pathname.startsWith("/vynrank/login/");
    const token = request.cookies.get(vynrankCookieName())?.value;
    const session = await verifyVynRankSession(token);

    if (isLogin) {
      if (session) {
        const dest = defaultPathForRole(session.role);
        return NextResponse.redirect(new URL(dest, request.url));
      }
      return NextResponse.next();
    }

    if (!session) {
      const login = new URL("/vynrank/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }

    if (!canAccessVynRankPath(session.role, pathname)) {
      return NextResponse.redirect(new URL(defaultPathForRole(session.role), request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff2?)$).*)",
  ],
};
