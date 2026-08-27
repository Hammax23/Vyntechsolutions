import { NextRequest, NextResponse } from "next/server";
import { getCmsService } from "@/lib/cms/content";
import { servicesData } from "@/data/servicesData";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const result = await getCmsService(params.slug, servicesData);
  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(
    {
      service: result.service,
      meta: {
        source: result.source,
        // If source is local-fallback, Strapi is unreachable or entry missing — panel edits won't show.
        hint:
          result.source === "strapi"
            ? "Serving PUBLISHED Strapi content. Draft edits need Publish in admin."
            : "Strapi not returning this service — check STRAPI_URL / API token / publish status.",
      },
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    }
  );
}
