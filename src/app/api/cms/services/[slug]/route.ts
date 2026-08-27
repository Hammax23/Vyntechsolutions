import { NextRequest, NextResponse } from "next/server";
import { getCmsService } from "@/lib/cms/content";
import { servicesData } from "@/data/servicesData";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const service = await getCmsService(params.slug, servicesData);
  if (!service) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(
    { service },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    }
  );
}
