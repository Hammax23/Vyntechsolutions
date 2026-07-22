import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import LetsTalkBusiness from "@/components/LetsTalkBusiness";
import TimedCTAPopup from "@/components/TimedCTAPopup";
import CookieConsent from "@/components/CookieConsent";
import ConditionalTawkChat from "@/components/ConditionalTawkChat";
// import FloatingSEOButton from "@/components/FloatingSEOButton";
import { organizationSchema, localBusinessSchema, websiteSchema, servicesSchema, faqSchema, reviewSchema, howToSchema } from "@/lib/seo.config";
import { getCmsFaqs, getCmsOrganizationProfile, getCmsGlobalSeo } from "@/lib/cms/content";
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
  const cmsFaqs = await getCmsFaqs();
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

  const liveFaqSchema =
    cmsFaqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: cmsFaqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : faqSchema;

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
            __html: JSON.stringify(websiteSchema),
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
            __html: JSON.stringify(liveFaqSchema),
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
            __html: JSON.stringify(howToSchema),
          }}
        />
      </head>
      <body className={`${inter.className} ${oswald.variable}`}>
        {children}
        <LetsTalkBusiness />
        <TimedCTAPopup />
        <CookieConsent />
        {/* <FloatingSEOButton /> */}
        
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KJSSQXW965"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KJSSQXW965');
          `}
        </Script>

        <ConditionalTawkChat />
      </body>
    </html>
  );
}
