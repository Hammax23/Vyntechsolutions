"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";

const FALLBACK_GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-KJSSQXW965";
const CONSENT_KEY = "cookieConsent";

type CookiePreferences = {
  essential?: boolean;
  analytics?: boolean;
  marketing?: boolean;
  functional?: boolean;
};

function readAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const prefs = JSON.parse(raw) as CookiePreferences;
    return Boolean(prefs.analytics);
  } catch {
    return false;
  }
}

/**
 * Loads GA4 from Strapi Global SEO (gaMeasurementId) when available,
 * otherwise falls back to NEXT_PUBLIC_GA_MEASUREMENT_ID.
 * Only loads after analytics cookie consent.
 */
export default function GoogleAnalytics() {
  const [enabled, setEnabled] = useState(false);
  const [gaId, setGaId] = useState(FALLBACK_GA_ID);

  useEffect(() => {
    const sync = () => setEnabled(readAnalyticsConsent());
    sync();
    window.addEventListener("cookieConsentUpdated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("cookieConsentUpdated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cms/content?type=global-seo")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        const id = data?.globalSeo?.gaMeasurementId;
        if (typeof id === "string" && id.trim().startsWith("G-")) {
          setGaId(id.trim());
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!gaId || !enabled) return null;

  return <NextGoogleAnalytics gaId={gaId} />;
}
