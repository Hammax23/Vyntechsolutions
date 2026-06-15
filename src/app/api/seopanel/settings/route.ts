import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateSeoSession, logSeoActivity } from "@/lib/seopanel/auth";

export async function GET(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let settings = await prisma.seoSettings.findUnique({ where: { id: "default" } });
  if (!settings) {
    settings = await prisma.seoSettings.create({
      data: {
        id: "default",
        siteUrl: "https://weborbitztech.ca",
        targetCountry: "CA",
        targetCities: ["Toronto", "Vancouver", "Montreal"],
        gaPropertyId: "G-KJSSQXW965",
      },
    });
  }
  return NextResponse.json({ settings });
}

export async function PATCH(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await request.json();
  if (data.sitemapLastSubmitted) data.sitemapLastSubmitted = new Date(data.sitemapLastSubmitted);

  const settings = await prisma.seoSettings.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });

  await logSeoActivity("Updated settings", "settings");
  return NextResponse.json({ settings });
}
