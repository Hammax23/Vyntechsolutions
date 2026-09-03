import { NextRequest, NextResponse } from "next/server";
import { verifyWorkflowSession, workflowCookieName } from "@/lib/workflow-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  matcher: ["/api/workflow/:path*"],
};
