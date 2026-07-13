import { NextResponse } from "next/server";
import {
  getCmsFaqs,
  getCmsGlobalSeo,
  getCmsHomepage,
  getCmsNavigation,
  getCmsPromos,
  getCmsFormConfig,
  getCmsJobOpenings,
  getCmsClientLogos,
  getCmsOrganizationProfile,
  getCmsStaticPage,
  getCmsLegalPage,
} from "@/lib/cms/content";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  switch (type) {
    case "faqs":
      return NextResponse.json({ faqs: await getCmsFaqs() });
    case "global-seo":
      return NextResponse.json({ globalSeo: await getCmsGlobalSeo() });
    case "homepage":
      return NextResponse.json({ homepage: await getCmsHomepage() });
    case "navigation":
      return NextResponse.json({ navigation: await getCmsNavigation() });
    case "promos":
      return NextResponse.json({
        promos: await getCmsPromos(searchParams.get("slot") || undefined),
      });
    case "form-config":
      return NextResponse.json({ formConfig: await getCmsFormConfig() });
    case "jobs":
      return NextResponse.json({ jobs: await getCmsJobOpenings() });
    case "client-logos":
      return NextResponse.json({ logos: await getCmsClientLogos() });
    case "organization":
      return NextResponse.json({ organization: await getCmsOrganizationProfile() });
    case "static-page": {
      const slug = searchParams.get("slug");
      if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
      return NextResponse.json({ page: await getCmsStaticPage(slug) });
    }
    case "legal-page": {
      const slug = searchParams.get("slug");
      if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
      return NextResponse.json({ page: await getCmsLegalPage(slug) });
    }
    default:
      return NextResponse.json(
        {
          error: "Unknown type",
          types: [
            "faqs",
            "global-seo",
            "homepage",
            "navigation",
            "promos",
            "form-config",
            "jobs",
            "client-logos",
            "organization",
            "static-page",
            "legal-page",
          ],
        },
        { status: 400 }
      );
  }
}
