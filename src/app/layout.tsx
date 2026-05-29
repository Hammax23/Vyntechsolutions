import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import LetsTalkBusiness from "@/components/LetsTalkBusiness";
import TimedCTAPopup from "@/components/TimedCTAPopup";
// import FloatingSEOButton from "@/components/FloatingSEOButton";
import { defaultSEO, organizationSchema, localBusinessSchema, websiteSchema, servicesSchema, faqSchema, reviewSchema, howToSchema } from "@/lib/seo.config";

const inter = Inter({ subsets: ["latin"] });
const oswald = Oswald({ 
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-oswald"
});

export const metadata: Metadata = defaultSEO;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
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
            __html: JSON.stringify(faqSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(reviewSchema),
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
        {/* <FloatingSEOButton /> */}
        
        {/* Tawk.to Live Chat Widget */}
        <Script
          id="tawk-to"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              (function(){
                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='https://embed.tawk.to/6a1a0626edf0db1c3406007b/1jpqqg1vi';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
