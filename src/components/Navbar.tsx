"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import VynTechLogo from "./VynTechLogo";

type NavItem = { title: string; slug: string };
type PrimaryLink = { label: string; href: string };
type SearchItem = { title: string; href: string; category: string };

const defaultNavServices: NavItem[] = [
  { title: "Web Development", slug: "web-development" },
  { title: "Mobile App Development", slug: "mobile-app-development" },
  { title: "Cloud Solutions", slug: "cloud-solutions" },
  { title: "AI/ML Solutions", slug: "ai-ml-solutions" },
  { title: "DevOps & CI/CD", slug: "devops-cicd" },
  { title: "UI/UX Design", slug: "ui-ux-design" },
  { title: "E-commerce Solutions", slug: "ecommerce-solutions" },
  { title: "Custom Software Development", slug: "custom-software-development" },
  { title: "SEO/Digital Marketing", slug: "seo-digital-marketing" },
  { title: "Maintenance & Support", slug: "maintenance-support" },
];

const defaultNavIndustries: NavItem[] = [
  { title: "Healthcare", slug: "healthcare" },
  { title: "Finance & Banking", slug: "finance-banking" },
  { title: "E-commerce & Retail", slug: "ecommerce-retail" },
  { title: "Education & E-learning", slug: "education" },
  { title: "Real Estate", slug: "real-estate" },
  { title: "Logistics & Transportation", slug: "logistics" },
  { title: "Entertainment & Media", slug: "entertainment-media" },
  { title: "Manufacturing", slug: "manufacturing" },
  { title: "Hospitality & Travel", slug: "hospitality-travel" },
  { title: "Telecommunications", slug: "telecommunications" },
];

const defaultPrimaryLinks: PrimaryLink[] = [
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

function buildSearchItems(services: NavItem[], industries: NavItem[]): SearchItem[] {
  return [
    { title: "Home", href: "/", category: "Pages" },
    { title: "About Us", href: "/about", category: "Pages" },
    { title: "Blog", href: "/blog", category: "Pages" },
    { title: "Careers", href: "/careers", category: "Pages" },
    { title: "Contact Us", href: "/lets-talk-business", category: "Pages" },
    ...services.map((s) => ({
      title: s.title,
      href: `/services/${s.slug}`,
      category: "Services",
    })),
    ...industries.map((i) => ({
      title: i.title,
      href: `/industries/${i.slug}`,
      category: "Industries",
    })),
  ];
}

const SERVICE_ICON_PATHS: Record<string, string> = {
  "web-development":
    "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418",
  "mobile-app-development":
    "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
  "cloud-solutions":
    "M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z",
  "ai-ml-solutions":
    "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z",
  "devops-cicd":
    "M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L6.75 2.906m9.944 18.08l-1.15-.964M5.106 6.214l-1.15-.964m17.99 5.13l-1.41-.513M5.954 15.436l-1.41-.514",
  "ui-ux-design":
    "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42",
  "ecommerce-solutions":
    "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z",
  "custom-software-development":
    "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
  "seo-digital-marketing":
    "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  "maintenance-support":
    "M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z",
  "tax-accounting":
    "M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V14.25zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18.75zm2.25-7.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V14.25zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18.75zm2.25-7.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V14.25zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18.75zm2.25-7.5h.008v.008H15.75v-.008zm0 2.25h.008v.008H15.75V14.25zm0 2.25h.008v.008H15.75v-.008zM3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5M5.625 3.75h12.75a1.875 1.875 0 011.875 1.875v14.25a1.875 1.875 0 01-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V5.625A1.875 1.875 0 015.625 3.75z",
};

function ServiceNavIcon({ slug }: { slug: string }) {
  const d = SERVICE_ICON_PATHS[slug] || SERVICE_ICON_PATHS["custom-software-development"];

  return (
    <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const INDUSTRY_ICON_PATHS: Record<string, string> = {
  healthcare:
    "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  "finance-banking":
    "M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z",
  "ecommerce-retail":
    "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z",
  education:
    "M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5",
  "real-estate":
    "M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819",
  logistics:
    "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12",
  "entertainment-media":
    "M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z",
  manufacturing:
    "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z",
  "hospitality-travel":
    "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z",
  telecommunications:
    "M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z",
};

function IndustryNavIcon({ slug }: { slug: string }) {
  const d =
    INDUSTRY_ICON_PATHS[slug] ||
    INDUSTRY_ICON_PATHS[slug.replace(/_/g, "-")] ||
    INDUSTRY_ICON_PATHS.healthcare;

  return (
    <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [navServices, setNavServices] = useState<NavItem[]>(defaultNavServices);
  const [navIndustries, setNavIndustries] = useState<NavItem[]>(defaultNavIndustries);
  const [primaryLinks, setPrimaryLinks] = useState<PrimaryLink[]>(defaultPrimaryLinks);
  const [careersHref, setCareersHref] = useState("/careers");
  const [searchItems, setSearchItems] = useState<SearchItem[]>(() =>
    buildSearchItems(defaultNavServices, defaultNavIndustries)
  );
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState({ code: "EN", name: "English", flag: "🇨🇦" });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const languages = [
    { code: "EN", name: "English", flag: "🇨🇦" },
    { code: "FR", name: "Français", flag: "🇨🇦" },
  ];

  useEffect(() => {
    Promise.all([
      fetch("/api/cms/content?type=navigation").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/cms/services").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/cms/industries").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([navData, servicesData, industriesData]) => {
        const services = (servicesData?.services as { title?: string; slug?: string }[] | undefined)
          ?.filter((s) => s.title && s.slug)
          .map((s) => ({ title: String(s.title), slug: String(s.slug) }));
        const industries = (industriesData?.industries as { title?: string; slug?: string }[] | undefined)
          ?.filter((i) => i.title && i.slug)
          .map((i) => ({ title: String(i.title), slug: String(i.slug) }));

        let nextServices = defaultNavServices;
        let nextIndustries = defaultNavIndustries;

        if (services && services.length > 0) {
          nextServices = services;
          setNavServices(services);
        }
        if (industries && industries.length > 0) {
          nextIndustries = industries;
          setNavIndustries(industries);
        }

        const nav = navData?.navigation as {
          primaryLinks?: { label?: string; href?: string }[];
        } | null;
        if (nav?.primaryLinks?.length) {
          const careers = nav.primaryLinks.find((l) =>
            String(l.href || "").toLowerCase().includes("careers")
          );
          if (careers?.href) {
            setCareersHref(String(careers.href));
          }
          const links = nav.primaryLinks
            .filter((l) => !String(l.href || "").toLowerCase().includes("careers"))
            .filter((l) => l.label && l.href)
            .map((l) => ({ label: String(l.label), href: String(l.href) }));
          if (links.length) {
            setPrimaryLinks(links);
          }
        }

        setSearchItems(buildSearchItems(nextServices, nextIndustries));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }
    const filtered = searchItems.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered);
  }, [searchQuery, searchItems]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };
    if (isSearchOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      if (!isMobileMenuOpen) {
        document.body.style.overflow = "unset";
      }
    };
  }, [isSearchOpen, isMobileMenuOpen]);

  const openSearch = () => {
    setIsSearchOpen(true);
    setIsMobileMenuOpen(false);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleSearchSelect = (href: string) => {
    closeSearch();
    router.push(href);
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleMouseEnter = (menu: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setMobileAccordion(null);
  };

  const toggleMobileAccordion = (menu: string) => {
    setMobileAccordion(mobileAccordion === menu ? null : menu);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent border-b border-white/20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-3 lg:py-4">
            <div className="flex items-center z-50">
              <div className="flex flex-col">
                <Link href="/">
                  <VynTechLogo onClick={() => setIsMobileMenuOpen(false)} />
                </Link>
              </div>
            </div>

            <div className="flex-1 flex justify-center">
              <div className="hidden lg:flex items-center gap-8">
                <div
                  className="relative"
                  onMouseEnter={() => handleMouseEnter("services")}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className="flex items-center gap-1 text-white text-sm font-light hover:text-white/80 transition-colors py-2">
                    WHAT WE DO
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <div
                  className="relative"
                  onMouseEnter={() => handleMouseEnter("industries")}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className="flex items-center gap-1 text-white text-sm font-light hover:text-white/80 transition-colors py-2">
                    WHO WE HELP
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {primaryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-white text-sm font-light hover:text-white/80 transition-colors py-2"
                  >
                    {link.label.toUpperCase()}
                  </Link>
                ))}
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-6">
              <Link href={careersHref} className="text-white text-sm font-light hover:text-white/80 transition-colors">
                Careers
              </Link>

              <button
                onClick={() => window.dispatchEvent(new CustomEvent("openLetsTalkBusiness"))}
                className="border border-white text-white px-6 py-2 text-sm font-light tracking-wider hover:bg-white hover:text-black transition-all duration-300"
              >
                LET&apos;S TALK BUSINESS
              </button>

              <button
                onClick={openSearch}
                className="text-white hover:text-white/80 transition-colors"
                aria-label="Open search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              <div ref={langRef} className="relative">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1 text-white hover:text-white/80 transition-colors"
                >
                  <span className="text-sm">{selectedLang.flag}</span>
                  <span className="text-sm font-light">{selectedLang.code}</span>
                </button>
              </div>
            </div>

            <button
              className="lg:hidden text-white z-50 p-2 -mr-2"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 relative flex flex-col justify-between">
                <span className={`w-full h-0.5 bg-white transform transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}></span>
                <span className={`w-full h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`}></span>
                <span className={`w-full h-0.5 bg-white transform transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleMobileMenu}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-40 lg:hidden transform transition-transform duration-500 ease-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full overflow-y-auto pt-20 pb-8 px-6">
          <nav className="space-y-1">
            <div className="border-b border-white/10">
              <button
                onClick={() => toggleMobileAccordion("services")}
                className="w-full flex items-center justify-between py-4 text-white text-lg font-light tracking-wide"
              >
                WHAT WE DO
                <svg
                  className={`w-4 h-4 transform transition-transform duration-300 ${mobileAccordion === "services" ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${mobileAccordion === "services" ? "max-h-[800px] pb-4" : "max-h-0"}`}>
                <div className="pl-4 space-y-4">
                  {navServices.map((service) => (
                    <Link
                      key={service.slug}
                      href={`/services/${service.slug}`}
                      onClick={toggleMobileMenu}
                      className="block text-white/70 text-sm hover:text-[#00B4FF] transition-colors"
                    >
                      {service.title}
                    </Link>
                  ))}

                  <div className="mt-4 pt-4 border-t border-white/20">
                      <p className="text-emerald-400 text-xs font-semibold mb-3">TAX & ACCOUNTING</p>
                      <Link href="/services/tax-accounting" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-emerald-400 transition-colors mb-2">Comprehensive Tax & Accounting</Link>
                      <Link href="/services/tax-accounting" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-emerald-400 transition-colors mb-2">Business Incorporation & CFO</Link>
                      <Link href="/services/tax-accounting" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-emerald-400 transition-colors mb-2">Financial Planning & Forecasting</Link>
                      <Link href="/services/tax-accounting" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-emerald-400 transition-colors mb-3">Government Grants Assistance</Link>
                      <Link
                        href="/services/tax-accounting"
                        onClick={toggleMobileMenu}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:from-emerald-500 hover:to-emerald-400 transition-all"
                      >
                        View All Tax Services
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                </div>
              </div>
            </div>

            <div className="border-b border-white/10">
              <button
                onClick={() => toggleMobileAccordion("industries")}
                className="w-full flex items-center justify-between py-4 text-white text-lg font-light tracking-wide"
              >
                WHO WE HELP
                <svg
                  className={`w-4 h-4 transform transition-transform duration-300 ${mobileAccordion === "industries" ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${mobileAccordion === "industries" ? "max-h-[500px] pb-4" : "max-h-0"}`}>
                <div className="pl-4 space-y-3">
                  {navIndustries.map((industry) => (
                    <Link
                      key={industry.slug}
                      href={`/industries/${industry.slug}`}
                      onClick={toggleMobileMenu}
                      className="block text-white/70 text-sm hover:text-[#00B4FF] transition-colors"
                    >
                      {industry.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={toggleMobileMenu}
                className="block py-4 text-white text-lg font-light tracking-wide border-b border-white/10 hover:text-[#00B4FF] transition-colors"
              >
                {link.label.toUpperCase()}
              </Link>
            ))}

            <Link
              href={careersHref}
              onClick={toggleMobileMenu}
              className="block py-4 text-white text-lg font-light tracking-wide border-b border-white/10 hover:text-[#00B4FF] transition-colors"
            >
              CAREERS
            </Link>
          </nav>

          <div className="mt-8">
            <button
              onClick={() => {
                toggleMobileMenu();
                window.dispatchEvent(new CustomEvent("openLetsTalkBusiness"));
              }}
              className="block w-full border border-white text-white py-4 text-sm font-light tracking-widest hover:bg-white hover:text-black transition-all duration-300 text-center"
            >
              LET&apos;S TALK BUSINESS
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <button
                onClick={openSearch}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-sm">Search</span>
              </button>

              <div className="flex items-center gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLang(lang)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedLang.code === lang.code
                        ? "bg-white/20 text-white"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.code}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {activeDropdown === "services" && (
        <div
          className="fixed top-[72px] left-0 right-0 z-40 bg-white shadow-lg"
          onMouseEnter={() => handleMouseEnter("services")}
          onMouseLeave={handleMouseLeave}
        >
          <div className="max-w-[1400px] mx-auto px-6 py-8">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-3 border-r border-gray-200 pr-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">WHAT WE DO</h3>
                <div className="mb-4">
                  <Image
                    src="/whatwedo.png"
                    alt="What We Do"
                    width={200}
                    height={120}
                    className="w-4/5 h-36 object-cover rounded-lg ml-0"
                  />
                </div>
                <p className="text-gray-700 text-sm">
                  Why data standards matter & why they&apos;re important
                </p>
              </div>

              <div className="col-span-5 grid grid-cols-2 gap-y-4 gap-x-4 border-r border-gray-200 pr-6">
                {navServices.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/services/${service.slug}`}
                    className="flex items-center gap-2 text-gray-700 hover:text-[#00B4FF] transition-colors"
                  >
                    <ServiceNavIcon slug={service.slug} />
                    <span className="text-sm">{service.title}</span>
                  </Link>
                ))}
              </div>

              <div className="col-span-4 bg-gradient-to-br from-[#0d9488] via-[#059669] to-[#047857] rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10">
                  <h4 className="text-white font-bold text-base mb-3">Tax & Accounting Services</h4>

                  <div className="space-y-2 mb-4">
                    <Link href="/services/tax-accounting" className="block border border-white/40 text-white text-xs px-3 py-2 rounded-full hover:bg-white hover:text-[#059669] transition-all duration-300 truncate">
                      Comprehensive Tax & Accounting
                    </Link>
                    <Link href="/services/tax-accounting" className="block border border-white/40 text-white text-xs px-3 py-2 rounded-full hover:bg-white hover:text-[#059669] transition-all duration-300 truncate">
                      Business Incorporation & CFO
                    </Link>
                    <Link href="/services/tax-accounting" className="block border border-white/40 text-white text-xs px-3 py-2 rounded-full hover:bg-white hover:text-[#059669] transition-all duration-300 truncate">
                      Financial Planning & Forecasting
                    </Link>
                    <Link href="/services/tax-accounting" className="block border border-white/40 text-white text-xs px-3 py-2 rounded-full hover:bg-white hover:text-[#059669] transition-all duration-300 truncate">
                      Government Grants Assistance
                    </Link>
                  </div>

                  <Link
                    href="/services/tax-accounting"
                    className="w-full bg-white text-[#059669] font-semibold py-2.5 px-4 rounded-lg hover:bg-white/90 transition-all duration-300 flex items-center justify-center gap-2 group text-sm"
                  >
                    <span>View All Services</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeDropdown === "industries" && (
        <div
          className="fixed top-[72px] left-0 right-0 z-40 bg-white shadow-lg"
          onMouseEnter={() => handleMouseEnter("industries")}
          onMouseLeave={handleMouseLeave}
        >
          <div className="max-w-[1400px] mx-auto px-6 py-8">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-3 border-r border-gray-200 pr-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">WHO WE HELP</h3>
                <div className="mb-4">
                  <Image
                    src="/whowehelp.png"
                    alt="Who We Help"
                    width={200}
                    height={120}
                    className="w-4/5 h-36 object-cover rounded-lg ml-0"
                  />
                </div>
                <p className="text-gray-700 text-sm">
                  Transforming industries with innovative solutions
                </p>
              </div>
              <div className="col-span-9 grid grid-cols-2 gap-y-5 gap-x-8">
                {navIndustries.map((industry) => (
                  <Link
                    key={industry.slug}
                    href={`/industries/${industry.slug}`}
                    className="flex items-center gap-3 text-gray-700 hover:text-[#00B4FF] transition-colors"
                  >
                    <IndustryNavIcon slug={industry.slug} />
                    <span className="text-sm">{industry.title}</span>
                    <span className="text-[#00B4FF]">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-[#1a1a2e]/95 backdrop-blur-sm">
          <button
            onClick={closeSearch}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
            aria-label="Close search"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex flex-col items-center justify-start pt-32 px-4">
            <div className="w-full max-w-2xl">
              <div className="relative">
                <svg
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pages, services..."
                  className="w-full bg-white/10 border border-white/20 rounded-full py-5 pl-16 pr-6 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-white/40 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {searchResults.length > 0 && (
                <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchSelect(result.href)}
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-b-0"
                    >
                      <div>
                        <p className="text-white font-medium">{result.title}</p>
                        <p className="text-white/50 text-sm">{result.category}</p>
                      </div>
                      <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery && searchResults.length === 0 && (
                <div className="mt-6 text-center">
                  <p className="text-white/50">No results found for &quot;{searchQuery}&quot;</p>
                </div>
              )}

              {!searchQuery && (
                <div className="mt-8">
                  <p className="text-white/40 text-sm mb-4">Quick Links</p>
                  <div className="flex flex-wrap gap-3">
                    {searchItems.slice(0, 6).map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearchSelect(item.href)}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/70 text-sm hover:bg-white/10 hover:text-white transition-colors"
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="mt-8 text-center text-white/30 text-sm">
                Press <kbd className="px-2 py-1 bg-white/10 rounded text-white/50">ESC</kbd> to close
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
