import {
  getCmsNavigation,
  getCmsService,
  getCmsServices,
  getCmsStaticPage,
  getCmsPromos,
} from "@/lib/cms/content";
import { servicesData, type ServiceData } from "@/data/servicesData";
import { DEFAULT_NAV_CHROME, mergeCopy } from "@/lib/ui-copy";

type NavChrome = typeof DEFAULT_NAV_CHROME;

export type ServiceDetailBundle = {
  slug: string;
  service: ServiceData | null;
  source: "strapi" | "local-fallback" | "missing";
  navChrome: NavChrome;
};

export async function loadServiceDetailBundle(slug: string): Promise<ServiceDetailBundle> {
  const [result, navigation] = await Promise.all([
    getCmsService(slug, servicesData).catch(() => null),
    getCmsNavigation().catch(() => null),
  ]);

  const navChrome = mergeCopy(
    DEFAULT_NAV_CHROME,
    (navigation?.chrome as Partial<NavChrome> | undefined) || undefined
  );

  if (!result) {
    return {
      slug,
      service: (servicesData[slug] as ServiceData) || null,
      source: servicesData[slug] ? "local-fallback" : "missing",
      navChrome,
    };
  }

  return {
    slug,
    service: result.service as unknown as ServiceData,
    source: result.source,
    navChrome,
  };
}

export async function loadServicesListingBundle() {
  const [services, staticPage, promo, navigation] = await Promise.all([
    getCmsServices(servicesData).catch(() => []),
    getCmsStaticPage("services").catch(() => null),
    getCmsPromos("services-promo").catch(() => []),
    getCmsNavigation().catch(() => null),
  ]);

  return {
    services,
    staticPage,
    promo: promo[0] || null,
    navChrome: mergeCopy(
      DEFAULT_NAV_CHROME,
      (navigation?.chrome as Partial<NavChrome> | undefined) || undefined
    ),
  };
}
