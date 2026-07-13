import { NextResponse } from "next/server";
import { getCmsServices } from "@/lib/cms/content";
import { servicesData } from "@/data/servicesData";

export async function GET() {
  const services = await getCmsServices(servicesData);
  return NextResponse.json({ services });
}
