"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const RANK_STEPS = [
  { position: 48, label: "Page 5" },
  { position: 24, label: "Page 3" },
  { position: 12, label: "Page 2" },
  { position: 5, label: "Top 10" },
  { position: 1, label: "#1 Spot" },
];

const CHART_HEIGHTS = [32, 48, 58, 70, 82, 96];

interface GoogleRankingPromoProps {
  compact?: boolean;
}

export default function GoogleRankingPromo({ compact = false }: GoogleRankingPromoProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [chartProgress, setChartProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const rankInterval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % RANK_STEPS.length);
    }, 2400);
    return () => clearInterval(rankInterval);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const chartInterval = setInterval(() => {
      setChartProgress((prev) => (prev >= CHART_HEIGHTS.length - 1 ? 0 : prev + 1));
    }, 550);
    return () => clearInterval(chartInterval);
  }, [mounted]);

  const currentRank = RANK_STEPS[stepIndex];
  const progressPercent = Math.min(98, Math.round(100 - (currentRank.position / 48) * 92));

  if (!mounted) {
    return (
      <div
        className={`${compact ? "w-full max-w-[300px] mx-auto" : "w-[248px] xl:w-[268px]"} h-[168px] rounded-xl bg-white/80 border border-white/90 animate-pulse`}
        aria-hidden
      />
    );
  }

  return (
    <Link
      href="/services/seo-digital-marketing"
      className={`group block seo-ranking-float ${compact ? "w-full max-w-[300px] mx-auto" : "w-[248px] xl:w-[268px]"}`}
      aria-label="Get your website Google ranking — SEO and digital marketing services"
    >
      <div className="relative">
        <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-[#4285F4]/15 to-[#34A853]/10 blur-lg opacity-60 group-hover:opacity-90 transition-opacity" />

        <div className="relative overflow-hidden rounded-xl border border-white/90 bg-white/95 backdrop-blur-sm shadow-[0_4px_24px_rgba(0,85,255,0.1)] group-hover:shadow-[0_8px_28px_rgba(0,85,255,0.18)] transition-shadow">
          <div className="h-0.5 w-full flex">
            <span className="flex-1 bg-[#4285F4]" />
            <span className="flex-1 bg-[#EA4335]" />
            <span className="flex-1 bg-[#FBBC05]" />
            <span className="flex-1 bg-[#34A853]" />
          </div>

          <div className="p-3.5">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="relative w-10 h-10 rounded-lg bg-[#f8fafc] border border-gray-100 flex items-center justify-center flex-shrink-0 seo-ranking-pulse">
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#34A853] border border-white flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 leading-none mb-1">
                  Search visibility
                </p>
                <div
                  key={stepIndex}
                  className="flex items-center gap-1.5 seo-ranking-fade-in"
                >
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#0055FF]/10 text-[#0055FF]">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-bold tabular-nums">#{currentRank.position}</span>
                  </span>
                  <span className="text-[10px] font-semibold text-[#34A853]">{currentRank.label}</span>
                </div>
              </div>
            </div>

            <div className="h-1 rounded-full bg-gray-100 overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#0055FF] transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-end justify-between gap-0.5 h-9 mb-3">
              {CHART_HEIGHTS.map((height, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-[2px] bg-gradient-to-t from-[#0055FF] to-[#00B4FF] min-w-[4px] max-w-[14px] mx-auto transition-all duration-400 ease-out"
                  style={{
                    height: i <= chartProgress ? `${height}%` : "18%",
                    opacity: i <= chartProgress ? 1 : 0.3,
                  }}
                />
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold text-[#1a1a2e] leading-tight">Get your Website</p>
              <p className="text-sm font-bold leading-tight mt-0.5">
                <span className="bg-gradient-to-r from-[#4285F4] via-[#0055FF] to-[#34A853] bg-clip-text text-transparent seo-ranking-shimmer-text">
                  Google RANKING
                </span>
              </p>
              <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-[#0055FF] group-hover:gap-1.5 transition-all">
                Boost with SEO
                <span aria-hidden>→</span>
              </span>
            </div>
          </div>

          <div className="seo-ranking-shimmer absolute inset-0 pointer-events-none" />
        </div>
      </div>
    </Link>
  );
}
