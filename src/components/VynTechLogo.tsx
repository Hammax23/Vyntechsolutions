"use client";

import React from "react";
import Image from "next/image";

interface VynTechLogoProps {
  className?: string;
  onClick?: () => void;
}

export default function VynTechLogo({ className = "", onClick }: VynTechLogoProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-1 sm:gap-3 lg:gap-3 group cursor-pointer ${className}`}
    >
      <div className="relative w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center shrink-0">
        <Image
          src="/logo.png"
          alt="VynTech Solutions"
          width={56}
          height={56}
          className="w-full h-full object-contain"
          priority
        />
      </div>

      <div className="flex flex-col justify-center -translate-y-px">
        <div
          className="flex items-center text-[1.35rem] lg:text-[1.8rem] tracking-[0.05em] leading-none text-white font-semibold"
          style={{ fontFamily: 'var(--font-oswald), "Oswald", sans-serif' }}
        >
          <span>VYN</span>
          <span className="bg-gradient-to-r from-[#00E1FF] via-[#0088FF] to-[#0055FF] text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(0,180,255,0.4)]">
            TECH
          </span>
        </div>

        <div className="flex items-center justify-center w-full mt-0.5">
          <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent to-[#00B4FF] opacity-70" />
          <span
            className="text-[0.52rem] lg:text-[0.68rem] tracking-[0.3em] leading-none uppercase text-white drop-shadow-sm font-medium px-2"
            style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}
          >
            SOLUTIONS
          </span>
          <div className="h-[1px] flex-grow bg-gradient-to-l from-transparent to-[#00B4FF] opacity-70" />
        </div>
      </div>
    </div>
  );
}
