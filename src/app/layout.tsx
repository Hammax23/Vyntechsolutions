import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import LetsTalkBusiness from "@/components/LetsTalkBusiness";
import TimedCTAPopup from "@/components/TimedCTAPopup";
import CookieConsent from "@/components/CookieConsent";
import ConditionalTawkChat from "@/components/ConditionalTawkChat";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import AnnouncementBar from "@/components/AnnouncementBar";
import { organizationSchema, localBusinessSchema, websiteSchema, servicesSchema, reviewSchema, techStackSchema } from "@/lib/seo.config";
import { getCmsOrganizationProfile, getCmsGlobalSeo } from "@/lib/cms/content";
import { rootMetadataFromCms } from "@/lib/cms/metadata";

const inter = Inter({ subsets: ["latin"] });
const oswald = Oswald({ 
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-oswald"
});

export async function generateMetadata(): Promise<Metadata> {
  return rootMetadataFromCms();
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [orgProfile, globalSeo] = await Promise.all([
    getCmsOrganizationProfile(),
    getCmsGlobalSeo(),
  ]);

  const liveOrgSchema = {
    ...organizationSchema,
    ...(orgProfile?.name ? { name: orgProfile.name } : {}),
    ...(orgProfile?.email || globalSeo?.email
      ? { email: String(orgProfile?.email || globalSeo?.email) }
      : {}),
    ...(orgProfile?.phone || globalSeo?.phone
      ? { telephone: String(orgProfile?.phone || globalSeo?.phone) }
      : {}),
    ...(orgProfile?.sameAs ? { sameAs: orgProfile.sameAs } : {}),
  };

  const liveLocalSchema = {
    ...localBusinessSchema,
    ...(orgProfile?.name ? { name: orgProfile.name } : {}),
    ...(orgProfile?.phone || globalSeo?.phone
      ? { telephone: String(orgProfile?.phone || globalSeo?.phone) }
      : {}),
    ...(orgProfile?.email || globalSeo?.email
      ? { email: String(orgProfile?.email || globalSeo?.email) }
      : {}),
    ...(orgProfile?.geoLatitude && orgProfile?.geoLongitude
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: String(orgProfile.geoLatitude),
            longitude: String(orgProfile.geoLongitude),
          },
        }
      : {}),
  };

  const liveWebsiteSchema = {
    ...websiteSchema,
    ...(typeof globalSeo?.siteName === "string" ? { name: globalSeo.siteName } : {}),
    ...(typeof globalSeo?.siteUrl === "string" ? { url: String(globalSeo.siteUrl).replace(/\/$/, "") } : {}),
  };

  return (
    <html lang="en-CA">
      <head>
        <meta name="geo.region" content="CA" />
        <meta name="geo.placename" content="Canada" />
        <meta name="ICBM" content="43.6532, -79.3832" />
        <meta name="theme-color" content="#0055FF" />
        <meta name="msapplication-TileColor" content="#0055FF" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(liveOrgSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(liveLocalSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(liveWebsiteSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(servicesSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              ...reviewSchema,
              ...(orgProfile?.ratingValue
                ? {
                    aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue: String(orgProfile.ratingValue),
                      reviewCount: String(orgProfile.reviewCount || 0),
                    },
                  }
                : {}),
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(techStackSchema),
          }}
        />
      </head>
      <body className={`${inter.className} ${oswald.variable}`}>
        <AnnouncementBar />
        {children}
        <LetsTalkBusiness />
        <TimedCTAPopup />
        <CookieConsent />
        <GoogleAnalytics />
        <ConditionalTawkChat />
      </body>
    </html>
  );
}
