"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

type HeroMediaItem = {
  type: "video" | "image";
  src: string;
  mobileSrc?: string;
};

type HeroSlide = {
  heading: string;
  subtext: string;
};

const DEFAULT_HERO_MEDIA: HeroMediaItem[] = [
  { type: "video", src: "/cover1.mp4", mobileSrc: "/cover1-mobile.mp4" },
  { type: "image", src: "/cover3.png" },
  { type: "image", src: "/cover2.png" },
];

// Duration for images (in milliseconds)
const IMAGE_DISPLAY_DURATION = 6000;

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    heading: "Build Faster.\nScale Smarter.",
    subtext: "From MVPs to enterprise platforms — we turn your vision into market-ready products in weeks, not months.",
  },
  {
    heading: "Your Tech Partner\nfor Growth",
    subtext: "Stop hiring. Start building. Get a dedicated development team that delivers results from day one.",
  },
  {
    heading: "Enterprise Solutions.\nStartup Speed.",
    subtext: "AI, Cloud, Mobile & Web — full-stack expertise to power your next big idea. No compromises.",
  },
  {
    heading: "Let's Build\nSomething Extraordinary",
    subtext: "Join 100+ businesses who chose VynTech to transform their digital presence and 10x their growth.",
  },
];

// Check if mobile on client side
const getIsMobile = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

export default function HeroSection() {
  const [heroMedia, setHeroMedia] = useState<HeroMediaItem[]>(DEFAULT_HERO_MEDIA);
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const imageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heroMediaLengthRef = useRef(heroMedia.length);
  const slidesLengthRef = useRef(slides.length);

  useEffect(() => {
    heroMediaLengthRef.current = heroMedia.length;
  }, [heroMedia.length]);

  useEffect(() => {
    slidesLengthRef.current = slides.length;
  }, [slides.length]);

  useEffect(() => {
    fetch("/api/cms/content?type=homepage")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const heroSlides = data?.homepage?.heroSlides;
        if (!Array.isArray(heroSlides) || heroSlides.length === 0) return;

        // We pull the slides from the CMS to ensure they are fully dynamic
        setSlides(
          heroSlides.map((s: { heading?: string; subtext?: string }) => ({
            heading: String(s.heading || "").replace(/\\n/g, "\n"),
            subtext: String(s.subtext || ""),
          }))
        );
        setCurrentSlide(0);

        const withMedia = heroSlides.filter(
          (s: { mediaUrl?: string }) => typeof s.mediaUrl === "string" && s.mediaUrl.trim()
        );
        if (withMedia.length > 0) {
          setHeroMedia(
            withMedia.map((s: { mediaUrl?: string; mediaType?: string }) => {
              const src = String(s.mediaUrl);
              const type = s.mediaType === "video" ? "video" : "image";
              return type === "video"
                ? { type: "video" as const, src, mobileSrc: src }
                : { type: "image" as const, src };
            })
          );
          setCurrentMediaIndex(0);
        }
      })
      .catch(() => { });
  }, []);

  const currentMedia = heroMedia[currentMediaIndex] ?? heroMedia[0];

  const goToNextMedia = useCallback(() => {
    const len = heroMediaLengthRef.current || 1;
    setCurrentMediaIndex((prev) => (prev + 1) % len);
  }, []);

  // Handle video ended event
  useEffect(() => {
    if (!isReady || !currentMedia || currentMedia.type !== "video") return;

    const videoEl = videoRef.current;
    if (!videoEl) return;

    let hasTransitioned = false;

    const triggerNext = () => {
      if (hasTransitioned) return;
      hasTransitioned = true;
      goToNextMedia();
    };

    const handleEnded = () => {
      triggerNext();
    };

    const handleTimeUpdate = () => {
      if (!hasTransitioned && videoEl.duration && videoEl.currentTime >= videoEl.duration - 0.3) {
        triggerNext();
      }
    };

    videoEl.addEventListener("ended", handleEnded);
    videoEl.addEventListener("timeupdate", handleTimeUpdate);

    // Play the video
    videoEl.currentTime = 0;
    videoEl.play().catch(() => { });

    return () => {
      videoEl.removeEventListener("ended", handleEnded);
      videoEl.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [currentMediaIndex, goToNextMedia, isReady, currentMedia?.type]);

  // Handle image display duration
  useEffect(() => {
    if (!isReady || !currentMedia || currentMedia.type !== "image") return;

    if (imageTimerRef.current) {
      clearTimeout(imageTimerRef.current);
    }

    imageTimerRef.current = setTimeout(() => {
      goToNextMedia();
    }, IMAGE_DISPLAY_DURATION);

    return () => {
      if (imageTimerRef.current) {
        clearTimeout(imageTimerRef.current);
      }
    };
  }, [currentMediaIndex, goToNextMedia, isReady, currentMedia?.type]);

  // Detect mobile device immediately
  useEffect(() => {
    const mobile = getIsMobile();
    setIsMobile(mobile);
    setIsReady(true);

    const handleResize = () => {
      setIsMobile(getIsMobile());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Preload media
  useEffect(() => {
    if (!isReady) return;

    const videoMedia = heroMedia.find((m) => m.type === "video");
    if (videoMedia) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "video";
      link.href = isMobile && videoMedia.mobileSrc ? videoMedia.mobileSrc : videoMedia.src;
      link.setAttribute("fetchpriority", "high");
      document.head.appendChild(link);
    }

    heroMedia
      .filter((m) => m.type === "image")
      .forEach((media) => {
        const img = new window.Image();
        img.src = media.src;
      });

    setMediaLoaded(true);
  }, [isReady, isMobile, heroMedia]);

  // Text slide rotation
  useEffect(() => {
    const interval = setInterval(() => {
      const len = slidesLengthRef.current || 1;
      setCurrentSlide((prev) => (prev + 1) % len);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % (slides.length || 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % (slides.length || 1));
  };

  const activeSlide = slides[currentSlide] ?? slides[0];

  return (
    <section className="relative w-full min-h-screen overflow-hidden flex flex-col justify-center">
      {/* Fallback Background for Loading */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] transition-opacity duration-500 ${mediaLoaded ? "opacity-0" : "opacity-100"
          }`}
        style={{ zIndex: 0 }}
      />

      {/* Media Backgrounds - Video and Images with Crossfade */}
      {isReady &&
        heroMedia.map((media, index) =>
          media.type === "video" ? (
            <video
              key={`${media.src}-${index}`}
              ref={index === currentMediaIndex ? videoRef : null}
              muted
              playsInline
              autoPlay={index === currentMediaIndex}
              loop={false}
              preload="auto"
              poster="/hero-poster.jpg"
              className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-out ${index === currentMediaIndex ? "opacity-100 z-[2]" : "opacity-0 z-[1]"
                }`}
              style={{
                willChange: "opacity",
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
              }}
            >
              <source
                src={isMobile && media.mobileSrc ? media.mobileSrc : media.src}
                type="video/mp4"
              />
            </video>
          ) : (
            <div
              key={`${media.src}-${index}`}
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-out ${index === currentMediaIndex ? "opacity-100 z-[2]" : "opacity-0 z-[1]"
                }`}
              style={{
                willChange: "opacity",
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
              }}
            >
              {media.src.startsWith("http") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={media.src}
                  alt="Hero background"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={media.src}
                  alt="Hero background"
                  fill
                  priority={index === 1}
                  className="object-cover"
                  sizes="100vw"
                />
              )}
            </div>
          )
        )}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/30 z-[3]" />

      {/* Content */}
      <div className="relative z-[10] w-full flex-1 flex items-center justify-center text-center pt-24 md:pt-32 pb-12">
        <div className="max-w-[1400px] mx-auto px-6 w-full">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            {/* Text Container with fixed minimum height to prevent button from jumping */}
            <div className="min-h-[350px] sm:min-h-[300px] md:min-h-[280px] lg:min-h-[320px] w-full flex flex-col items-center justify-start pt-4 md:pt-0">
              {/* Heading */}
              <motion.h1
                key={`heading-${currentSlide}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-white text-5xl md:text-6xl lg:text-7xl font-light leading-tight mb-6"
              >
                {activeSlide.heading.split("\n").map((line, index) => (
                  <span key={index} className="block">
                    {line}
                  </span>
                ))}
              </motion.h1>

              {/* Subtext */}
              <motion.p
                key={`subtext-${currentSlide}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                className="text-white/90 text-lg md:text-xl font-light mb-8 max-w-2xl mx-auto"
              >
                {activeSlide.subtext}
              </motion.p>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("openLetsTalkBusiness"))}
              className="inline-flex items-center justify-center gap-2 border border-white text-white px-8 py-3 text-sm font-light tracking-wider hover:bg-white hover:text-black transition-all duration-300"
            >
              GET FREE CONSULTATION
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="hidden md:block w-full mt-16 pt-10 border-t border-white/10 max-w-3xl mx-auto"
            >
              <div className="grid grid-cols-3 divide-x divide-white/10 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="flex flex-col items-center justify-center px-2 sm:px-4"
                >
                  <span className="text-3xl md:text-4xl font-light text-white mb-2">12+</span>
                  <span className="text-[10px] md:text-xs font-medium tracking-[0.2em] text-white/50 uppercase">YEARS EXPERIENCE</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.0 }}
                  className="flex flex-col items-center justify-center px-2 sm:px-4"
                >
                  <span className="text-3xl md:text-4xl font-light text-white mb-2">50+</span>
                  <span className="text-[10px] md:text-xs font-medium tracking-[0.2em] text-white/50 uppercase">PROJECTS DELIVERED</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="flex flex-col items-center justify-center px-2 sm:px-4"
                >
                  <span className="text-3xl md:text-4xl font-light text-white mb-2">98%</span>
                  <span className="text-[10px] md:text-xs font-medium tracking-[0.2em] text-white/50 uppercase">CLIENT SATISFACTION</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 text-white/70 hover:text-white transition-colors"
      >
        <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 text-white/70 hover:text-white transition-colors"
      >
        <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Accessibility Icon (Bottom Left) */}
      <button className="absolute left-4 md:left-6 bottom-6 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-white w-6" : "bg-white/50"
              }`}
          />
        ))}
      </div>
    </section>
  );
}
