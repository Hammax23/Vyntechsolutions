"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type ClientLogo = {
  name: string;
  logoUrl?: string;
};

const DEFAULT_LOGOS: ClientLogo[] = [
  { name: "Maple Harvest Foods" },
  { name: "True North Realty" },
  { name: "ShopBC Online" },
  { name: "Prairie Farms" },
  { name: "Calgary Homes" },
  { name: "Fresh Market" },
  { name: "CanadaCart" },
  { name: "Ontario Bites" },
  { name: "Edmonton Properties" },
  { name: "West Coast Eats" },
  { name: "Vancouver Realtors" },
  { name: "Quick Shop" },
];

export default function LogoCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [logos, setLogos] = useState<ClientLogo[]>(DEFAULT_LOGOS);

  useEffect(() => {
    fetch("/api/cms/content?type=client-logos")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const list = data?.logos as
          | { name?: string; logoUrl?: string; logo?: { url?: string } | null }[]
          | undefined;
        if (!list?.length) return;
        setLogos(
          list.map((item) => {
            const fromMedia =
              item.logo && typeof item.logo === "object" && item.logo.url
                ? String(item.logo.url)
                : undefined;
            const logoUrl = item.logoUrl ? String(item.logoUrl) : fromMedia;
            return {
              name: String(item.name || "Client"),
              logoUrl: logoUrl || undefined,
            };
          })
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let scrollPosition = 0;
    const speed = 0.5;

    const animate = () => {
      scrollPosition += speed;

      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }

      scrollContainer.style.transform = `translateX(-${scrollPosition}px)`;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [logos]);

  const loopLogos = [...logos, ...logos];

  const LogoItem = ({ children }: { children: React.ReactNode }) => (
    <div className="flex-shrink-0 flex items-center justify-center h-12 md:h-16 px-8 md:px-12 transition-all duration-300 select-none">
      {children}
    </div>
  );

  return (
    <section className="w-full bg-white py-6 md:py-8 overflow-hidden">
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

        <div className="overflow-hidden">
          <div
            ref={scrollRef}
            className="flex items-center gap-6 md:gap-10 will-change-transform"
            style={{ width: "max-content" }}
          >
            {loopLogos.map((logo, index) => (
              <LogoItem key={`${logo.name}-${index}`}>
                {logo.logoUrl ? (
                  <div className="relative h-8 md:h-10 w-28 md:w-36">
                    <Image
                      src={logo.logoUrl}
                      alt={logo.name}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <span className="text-lg md:text-xl font-semibold text-gray-800 whitespace-nowrap">
                    {logo.name}
                  </span>
                )}
              </LogoItem>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
