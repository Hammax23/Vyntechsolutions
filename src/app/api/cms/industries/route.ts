import { NextResponse } from "next/server";
import { getCmsIndustries } from "@/lib/cms/content";
import { industriesData } from "@/data/industriesData";

export async function GET() {
  const industries = await getCmsIndustries(industriesData);
  return NextResponse.json({ industries });
}
