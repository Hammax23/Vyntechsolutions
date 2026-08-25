"use client";

import { useEffect, useRef, useState } from "react";

type ClientLogo = {
  name: string;
  logoUrl?: string;
};

const LOCAL_LOGOS: Record<string, string> = {
  "Maple Harvest Foods": "/clients/maple-harvest-foods.svg",
  "True North Realty": "/clients/true-north-realty.svg",
  "ShopBC Online": "/clients/shopbc-online.svg",
  "Prairie Farms": "/clients/prairie-farms.svg",
  "Calgary Homes": "/clients/calgary-homes.svg",
  "Fresh Market": "/clients/fresh-market.svg",
  "CanadaCart": "/clients/canadacart.svg",
  "Ontario Bites": "/clients/ontario-bites.svg",
  "Edmonton Properties": "/clients/edmonton-properties.svg",
  "West Coast Eats": "/clients/west-coast-eats.svg",
  "Vancouver Realtors": "/clients/vancouver-realtors.svg",
  "Quick Shop": "/clients/quick-shop.svg",
  QuickShop: "/clients/quick-shop.svg",
  "Northern Grind Coffee": "/clients/northern-grind-coffee.svg",
  "Snowline Hotels": "/clients/snowline-hotels.svg",
  "Great Lakes Logistics": "/clients/great-lakes-logistics.svg",
  "Peak Fitness": "/clients/peak-fitness.svg",
  "Harbour & Co": "/clients/harbour-and-co.svg",
  "Atlantic Dental": "/clients/atlantic-dental.svg",
  "Rideau Markets": "/clients/rideau-markets.svg",
  "Muskoka Lodge": "/clients/muskoka-lodge.svg",
  "Nova Labs": "/clients/nova-labs.svg",
  "Pacific Bloom": "/clients/pacific-bloom.svg",
  "Yukon Outfitters": "/clients/yukon-outfitters.svg",
  "Ottawa Legal": "/clients/ottawa-legal.svg",
};

const DEFAULT_LOGOS: ClientLogo[] = Object.entries(LOCAL_LOGOS)
  .filter(([name]) => name !== "QuickShop")
  .map(([name, logoUrl]) => ({ name, logoUrl }));

function resolveLogoUrl(name: string, logoUrl?: string) {
  if (logoUrl && logoUrl.trim()) return logoUrl.trim();
  return LOCAL_LOGOS[name] || LOCAL_LOGOS[name.replace(/\s+/g, "")] || undefined;
}

function LogoItem({ logo }: { logo: ClientLogo }) {
  return (
    <div className="flex-shrink-0 flex items-center justify-center h-12 md:h-14 select-none">
      {logo.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo.logoUrl}
          alt={logo.name}
          className="h-10 md:h-12 w-auto max-w-[220px] object-contain opacity-90"
        />
      ) : (
        <span className="text-lg md:text-xl font-semibold text-gray-800 whitespace-nowrap">
          {logo.name}
        </span>
      )}
    </div>
  );
}

function MarqueeRow({
  logos,
  direction,
}: {
  logos: ClientLogo[];
  direction: "rtl" | "ltr";
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const loopLogos = [...logos, ...logos];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let scrollPosition = 0;
    const speed = 0.5;

    const animate = () => {
      const halfWidth = scrollContainer.scrollWidth / 2;
      if (halfWidth <= 0) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      scrollPosition += speed;
      if (scrollPosition >= halfWidth) scrollPosition = 0;

      const offset =
        direction === "rtl" ? -scrollPosition : scrollPosition - halfWidth;
      scrollContainer.style.transform = `translateX(${offset}px)`;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [logos, direction]);

  return (
    <div className="overflow-hidden">
      <div
        ref={scrollRef}
        className="flex items-center gap-4 md:gap-5 will-change-transform"
        style={{ width: "max-content" }}
      >
        {loopLogos.map((logo, index) => (
          <LogoItem key={`${direction}-${logo.name}-${index}`} logo={logo} />
        ))}
      </div>
    </div>
  );
}

export default function LogoCarousel() {
  const [logos, setLogos] = useState<ClientLogo[]>(DEFAULT_LOGOS);

  useEffect(() => {
    fetch("/api/cms/content?type=client-logos")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const list = data?.logos as
          | { name?: string; logoUrl?: string; logo?: { url?: string } | null }[]
          | undefined;
        if (!list?.length) return;
        const fromCms = list.map((item) => {
          const name = String(item.name || "Client");
          const fromMedia =
            item.logo && typeof item.logo === "object" && item.logo.url
              ? String(item.logo.url)
              : undefined;
          return {
            name,
            logoUrl: resolveLogoUrl(name, item.logoUrl ? String(item.logoUrl) : fromMedia),
          };
        });
        setLogos(fromCms);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="w-full bg-white py-7 md:py-9 overflow-hidden border-y border-slate-200">
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <MarqueeRow logos={logos} direction="rtl" />
      </div>
    </section>
  );
}
