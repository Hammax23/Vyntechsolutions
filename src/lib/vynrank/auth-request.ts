import { NextRequest, NextResponse } from "next/server";
import {
  verifyVynRankSession,
  vynrankCookieName,
  type VynRankSessionPayload,
} from "@/lib/vynrank/session";
import { canAccessNav, type VynRankNavKey } from "@/lib/vynrank/acl";

export async function requireVynRankSession(
  request: NextRequest
): Promise<VynRankSessionPayload | NextResponse> {
  const token = request.cookies.get(vynrankCookieName())?.value;
  const session = await verifyVynRankSession(token);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

export function requireVynRankNav(
  session: VynRankSessionPayload,
  key: VynRankNavKey
): NextResponse | null {
  if (!canAccessNav(session.role, key)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export function isSessionResponse(
  value: VynRankSessionPayload | NextResponse
): value is NextResponse {
  return value instanceof NextResponse;
}
