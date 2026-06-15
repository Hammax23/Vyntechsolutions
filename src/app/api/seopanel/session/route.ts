import { NextRequest, NextResponse } from "next/server";
import { validateSeoSession } from "@/lib/seopanel/auth";

export async function GET(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ valid: true, email: session.email, expiresAt: session.expiresAt });
}
