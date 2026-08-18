"use client";

import React from "react";
import Image from "next/image";

interface VynTechLogoProps {
  className?: string;
  onClick?: () => void;
  darkText?: boolean;
}

export default function VynTechLogo({ className = "", onClick, darkText = false }: VynTechLogoProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-1 sm:gap-3 lg:gap-3 group cursor-pointer ${className}`}
    >
      <div className="relative w-10 h-10 lg:w-11 lg:h-11 flex items-center justify-center shrink-0 -translate-y-0.5">
        <Image
          src="/logo.png"
          alt="VynTech Solutions"
          width={44}
          height={44}
          className={`w-full h-full object-contain ${darkText ? "brightness-0" : ""}`}
          priority
        />
      </div>

      <span
        className={`-translate-y-0.5 text-[1.4rem] lg:text-[1.85rem] tracking-[0.01em] leading-none font-light lowercase ${darkText ? "text-black" : "text-white"}`}
        style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}
      >
        vyntech
      </span>
    </div>
  );
}
