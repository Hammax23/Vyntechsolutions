import { NextResponse } from "next/server";
import { getCmsIndustries } from "@/lib/cms/content";
import { industriesData } from "@/data/industriesData";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const industries = await getCmsIndustries(industriesData);
  return NextResponse.json(
    { industries },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    }
  );
}
