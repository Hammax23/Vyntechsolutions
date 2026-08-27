import { NextResponse } from "next/server";
import { getCmsServices } from "@/lib/cms/content";
import { servicesData } from "@/data/servicesData";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const services = await getCmsServices(servicesData);
  return NextResponse.json(
    { services },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    }
  );
}
