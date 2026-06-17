"use client";

import React from 'react';

interface AnimatedLogoProps {
  className?: string;
  onClick?: () => void;
}

export default function AnimatedLogo({ className = "", onClick }: AnimatedLogoProps) {
  return (
    <div onClick={onClick} className={`flex items-center gap-1 sm:gap-3 lg:gap-3 group cursor-pointer ${className}`}>
      {/* Logo Mark */}
      <div className="relative w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center shrink-0 -translate-y-1">
        
        {/* The Orbit Animation Container */}
        <div className="absolute inset-0 overflow-visible">
          <style>
            {`
              @keyframes orbit-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes snake-coil {
                0% { stroke-dashoffset: 200; }
                100% { stroke-dashoffset: -200; }
              }
              .animate-orbit {
                animation: orbit-spin 6s linear infinite;
                transform-origin: center;
              }
              .animate-snake {
                stroke-dasharray: 120 80;
                animation: snake-coil 3s linear infinite;
              }
            `}
          </style>
          
          <div className="w-full h-full relative">
            {/* Base Ring (Faint static background ring) */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible z-0" xmlns="http://www.w3.org/2000/svg">
              <ellipse 
                cx="50" 
                cy="50" 
                rx="42" 
                ry="18" 
                transform="rotate(-35 50 50)"
                stroke="#00B4FF" 
                strokeWidth="1" 
                fill="none"
                className="opacity-20"
              />
            </svg>

            {/* Back part of the animated ring (behind the W) */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible z-0" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="orbitSwoosh" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00E1FF" />
                  <stop offset="50%" stopColor="#00A2FF" />
                  <stop offset="100%" stopColor="#00B4FF" />
                </linearGradient>
                {/* Mask to only show the back half of the ellipse */}
                <clipPath id="backHalfMask">
                  <rect x="0" y="0" width="100" height="48" transform="rotate(-35 50 50)" />
                </clipPath>
              </defs>
              
              <ellipse 
                cx="50" 
                cy="50" 
                rx="42" 
                ry="18" 
                transform="rotate(-35 50 50)"
                stroke="url(#orbitSwoosh)" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
                fill="none"
                clipPath="url(#backHalfMask)"
                className="animate-snake opacity-60"
              />
            </svg>

            {/* The W Letter (Static, centered) */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <svg viewBox="0 0 100 100" className="w-10 h-10 lg:w-[3.6rem] lg:h-[3.6rem] drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Right Shape of the W */}
                <path d="M 42 30 L 60 30 C 65 45, 70 60, 75 75 C 80 55, 95 35, 102 30 L 85 78 C 80 82, 75 82, 68 78 Z" fill="#ffffff" />
                
                {/* Left Shape of the W */}
                <path d="M 12 25 L 34 25 C 42 45, 48 65, 52 75 C 60 55, 70 40, 78 45 L 60 85 C 50 90, 40 85, 34 85 Z" fill="#ffffff" />
              </svg>
            </div>

            {/* Front part of the animated ring (in front of the W) */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-[0_0_8px_rgba(0,180,255,0.8)] overflow-visible z-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                {/* Mask to only show the front half of the ellipse */}
                <clipPath id="frontHalfMask">
                  <rect x="0" y="48" width="100" height="52" transform="rotate(-35 50 50)" />
                </clipPath>
              </defs>

              <ellipse 
                cx="50" 
                cy="50" 
                rx="42" 
                ry="18" 
                transform="rotate(-35 50 50)"
                stroke="url(#orbitSwoosh)" 
                strokeWidth="4.5" 
                strokeLinecap="round" 
                fill="none"
                clipPath="url(#frontHalfMask)"
                className="animate-snake"
              />

              {/* Rotating dot around the orbit */}
              <g className="animate-orbit">
                <circle cx="9" cy="50" r="4.5" fill="#00E1FF" className="drop-shadow-[0_0_5px_rgba(0,225,255,0.8)]" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Text Container */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center text-[1.2rem] lg:text-[1.6rem] tracking-[0.05em] leading-none text-white font-semibold" style={{ fontFamily: 'var(--font-oswald), "Oswald", sans-serif' }}>
          <span>VYN</span>
          <span>
            {/* Gradient TECH */}
            <span className="bg-gradient-to-r from-[#00E1FF] via-[#0088FF] to-[#0055FF] text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(0,180,255,0.4)]">TECH</span>
          </span>
        </div>
        
        <div className="flex items-center justify-center w-full mt-0.5">
          <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent to-[#00B4FF] opacity-70"></div>
          {/* SOLUTIONS in White */}
          <span className="text-[0.45rem] lg:text-[0.6rem] tracking-[0.3em] leading-none uppercase text-white drop-shadow-sm font-medium px-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            SOLUTIONS
          </span>
          <div className="h-[1px] flex-grow bg-gradient-to-l from-transparent to-[#00B4FF] opacity-70"></div>
        </div>
      </div>
    </div>
  );
}
