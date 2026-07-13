import { NextRequest, NextResponse } from "next/server";
import { getCmsIndustry } from "@/lib/cms/content";
import { industriesData } from "@/data/industriesData";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const industry = await getCmsIndustry(params.slug, industriesData);
  if (!industry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ industry });
}
